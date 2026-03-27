---
layout: default
title: Dev Audio Digest
---

# Dev Audio Digest

{% for post in site.posts %}
### [{{ post.title }}]({{ post.url | relative_url }})
<small>{{ post.date | date: "%Y-%m-%d" }} · {{ post.categories | join: ", " }}</small>

---
{% endfor %}
