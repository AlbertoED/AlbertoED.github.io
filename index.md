---
layout: page
title: Página Alberto
tagline: Proyectos GitHub Del Grupo de Sistemas Inteligentes de la UPM
---
{% include JB/setup %}

Here's a sample "posts list".

<ul class="posts">
  {% for post in site.posts %}
    <li><span>{{ post.date | date_to_string }}</span> &raquo; <a href="{{ BASE_PATH }}{{ post.url }}">{{ post.title }}</a></li>
  {% endfor %}
</ul>


