#!/usr/bin/env python3
"""Fetch both public Substack RSS feeds and write a combined static JSON index."""
import email.utils
import html
import json
import re
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

FEEDS = [
    {"url": "https://nouroumousse.substack.com/feed", "name": "Noursletter", "key": "noursletter"},
    {"url": "https://tamazight.substack.com/feed", "name": "Tamazight", "key": "tamazight"},
]
OUTPUT = Path("data/substack-posts.json")


def local_name(tag):
    return tag.rsplit("}", 1)[-1].lower()


def child_text(element, *names):
    wanted = set(names)
    for child in element.iter():
        if local_name(child.tag) in wanted and child.text:
            return child.text.strip()
    return ""


def plain_text(value):
    value = re.sub(r"<(script|style)\b[^>]*>[\s\S]*?</\1>", " ", value, flags=re.I)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def parse_date(value):
    if not value:
        return ""
    try:
        parsed = email.utils.parsedate_to_datetime(value)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(timezone.utc).isoformat()
    except (TypeError, ValueError, OverflowError):
        return ""


def fetch_feed(feed):
    # Substack returns 403 to GitHub-hosted runner IPs. Fetch through a
    # lightweight public RSS proxy, with a direct request as a fallback.
    candidates = [
        "https://proxy.cors.dev/" + feed["url"],
        feed["url"],
    ]
    last_error = None
    for feed_url in candidates:
        request = urllib.request.Request(
            feed_url,
            headers={
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/131.0 Safari/537.36",
                "Accept": "application/rss+xml, application/xml, text/xml, */*",
            }
        )
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                root = ET.fromstring(response.read())
            break
        except Exception as error:
            last_error = error
    else:
        raise last_error

    posts = []
    for item in (node for node in root.iter() if local_name(node.tag) == "item"):
        title = child_text(item, "title")
        url = child_text(item, "link")
        guid = child_text(item, "guid") or url
        published = parse_date(child_text(item, "pubdate", "published", "updated"))
        content = child_text(item, "encoded", "content")
        summary = child_text(item, "description", "summary")
        body = content or summary
        if not title or not url:
            continue
        if not body:
            body = "<p>This post is available on the original publication.</p>"
        posts.append({
            "id": feed["key"] + "-" + re.sub(r"[^a-z0-9]+", "-", (guid or url).lower()).strip("-")[-90:],
            "title": html.unescape(title),
            "url": url,
            "guid": guid,
            "published": published,
            "publication": feed["name"],
            "publicationKey": feed["key"],
            "summary": plain_text(summary or body)[:360],
            "contentHtml": body,
        })
    return posts


def main():
    combined = []
    errors = []
    for feed in FEEDS:
        try:
            combined.extend(fetch_feed(feed))
        except Exception as error:
            errors.append(f'{feed["name"]}: {error}')

    # Do not replace a working index with an empty/partial result if a feed fails.
    if errors:
        raise SystemExit("RSS sync failed; keeping the previous index. " + " | ".join(errors))
    combined.sort(key=lambda post: post["published"], reverse=True)
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT.write_text(json.dumps({
        "updatedAt": datetime.now(timezone.utc).isoformat(),
        "sources": [{"name": feed["name"], "url": feed["url"]} for feed in FEEDS],
        "posts": combined,
    }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Synced {len(combined)} posts from {len(FEEDS)} publications.")


if __name__ == "__main__":
    main()
