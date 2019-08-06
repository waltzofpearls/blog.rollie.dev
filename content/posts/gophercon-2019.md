---
title: "GopherCon 2019"
date: 2019-08-04T13:41:33-07:00
tags: ["Tech", "Go", "Programming Language", "San Diego"]
draft: false
---

<center>
  ![San Diego](/images/gophercon-2019/san-diego.jpg)
  <span style="font-size:5em;">&nbsp;+&nbsp;</span>
  ![GopherCon 2019](/images/gophercon-2019/gophercon.png)
  <span style="font-size:5em;">&nbsp;=&nbsp;<3</span>
</center>

**TL;DR** Some liveblogs from the conf if only the sessions interest you:
<a href="https://about.sourcegraph.com/go" rel="external">about.sourcegraph.com/go</a>.

A week ago (July 25 - July 27) I went to the beautiful city of San Diego and attended GopherCon 2019.
For Go developers in North America, GopherCon is probably the most exciting and biggest Go meetup that
takes place annually. In two days, gophers around the world gathering together, networking, sharing
their knowledge, excitement and feedback about the Go programming language. It was an event I had been
eagerly anticipating since the beginning of the year.

<!--more-->

### The conference

It was my 2nd time at GopherCon. Last year I went to Denver and attended the conference when it was
hosted at Colorado Convention Centre. I still remember the moment when I stepped into the main theatre
before the opening keynote, seeing all the fellow gophers, I was deeply touched. I also recall
<a href="https://twitter.com/kelseyhightower" rel="external">Kelsey Hightower</a>'s amazing talk
<a href="https://youtu.be/U7glyWYj4qg" rel="external">Going Serverless</a>, and his great humor when
he said "<a href="https://twitter.com/kelseyhightower/status/1022837097743319040" rel="external">good developers copy; great developers paste</a>".

After 5 years in Denver, this year the conference was moved to San Diego, and hosted at
<a href="https://goo.gl/maps/hTCPmvD3FjgLgBcW8" rel="external">Marriott Marquis San Diego Marina</a>.
Lots of great talks, learnings, and of course, some nice swags collected there :)

<center>
  ![Before the conf 1](/images/gophercon-2019/before-the-conf-1.jpg)
  &nbsp; &nbsp;
  ![Before the conf 2](/images/gophercon-2019/before-the-conf-2.jpg)
</center>

The opening keynote <a href="https://about.sourcegraph.com/go/gophercon-2019-on-the-road-to-go-2" rel="external">On the road to Go 2</a>
was given by <a href="https://twitter.com/_rsc" rel="external">Russ Cox</a>. Last year he gave an
update on Go 2 through a recorded video <a href="https://youtu.be/6wIP3rO6On8" rel="external">Go 2 Drafts Announcement</a>.
It was nice to see the Go team had been working with the community. Having the decisions driven by a
feedback loop, and only ship changes when they are thoroughly experimented and simplified.

It was pleased to see the Go team listened to the voices from the community on the controversial `try`
vs `err != nil` proposal, and moving forward with **generics** experiments, which was later covered by
another awesome talk <a href="https://about.sourcegraph.com/go/gophercon-2019-generics-in-go" rel="external">Generics in Go</a>
presented by <a href="https://github.com/ianlancetaylor" rel="external">Ian Lance Taylor</a>. Even
before Go 2, we could still get nice things like the  new error handling helpers `Unwrap` interface,
`errors.Is` and `errors.As` in the upcoming Go 1.13 release. Go please (`gopls`) was recently
introduced to consolidates all the tools used by our editors into one, and hopefully my vim will
<a href="https://about.sourcegraph.com/go/gophercon-2019-go-pls-stop-breaking-my-editor" rel="external">stop breaking</a>
after upgrading to newer versions of Go.

<center>
  ![Why generics](/images/gophercon-2019/why-generics.jpg)
</center>

Ron Evans, aka. <a href="https://twitter.com/deadprogram" rel="external">@deadprogram</a>, gave a
high quality talk on <a href="https://github.com/tinygo-org/tinygo" rel="external">TinyGo</a> and
running Go code on microcontrollers. I've always dreamed of writing Go for Arduino. The
approach TinyGo took by using Go language tools and LLVM to optimize the size of the binary was
very inspiring. As always, Ron got to fly his drone and demonstrated TinyGo + GoCV working together.

In addition to those, more stunningly presented talks I went to and learned a ton from:

- <a href="https://twitter.com/davecheney" rel="external">Dave Cheney</a>'s <a href="https://about.sourcegraph.com/go/gophercon-2019-two-go-programs-three-different-profiling-techniques-in-50-minutes" rel="external">Go profiling</a>:
live coding preso for demonstrating `go tool pprof`, `go tool trace` and troubleshooting performance
issues with those tools.
- Patrick Hawley's <a href="https://about.sourcegraph.com/go/gophercon-2019-controlling-the-go-runtime" rel="external">Controlling the Go runtime</a>:
what are runtime functions, eg. `Goexit()` and `Gosched()`, why we would want to use them, and what
else we could do with them.
- <a href="https://about.sourcegraph.com/go/gophercon-2019-socket-to-me-where-do-sockets-live-in-go" rel="external">Where do Sockets live in Go?</a>
from <a href="https://twitter.com/gabbifish" rel="external">Gabbi Fisher</a>: TIL - in Go we could use
socket option `SO_REUSEADDR` to bind two services on the same TCP/UDP address + port.
- <a href="https://about.sourcegraph.com/go/gophercon-2019-detecting-incompatible-api-changes" rel="external">Detecting incompatible API changes</a>
from <a href="https://github.com/jba" rel="external">Jonathan Amsterdam</a>: deep dive in API
compatibility for Go packages.

### The city of San Diego

In my opinion, last year's venue at Colorado Convention Centre was better and more convenient.
My hotel was only 2 minutes away. That said, between Denver and San Diego, the latter had my
heart <3

I love the weather, the view from the hotel, mexican food, USS Midway Museum, etc.

<center>
  ![Habour view](/images/gophercon-2019/habour-view.jpg)
  &nbsp;
  ![Mexican food](/images/gophercon-2019/mexican-food.jpg)
  &nbsp;
  ![USS Midway](/images/gophercon-2019/uss-midway.jpg)
</center>

While in the city, I tried e-scooters rental with <a href="https://www.li.me/" rel="external">Lime</a>
and <a href="https://www.bird.co/" rel="external">Bird</a>, and rode e-scooters a couple times
between my hotel (Hilton) and the venue (Marriott). It was a fun experience, and I almost wanted
to buy one for myself, but riding it on a road was scary without a helmet. Also very sadly,
e-scooters are banned in BC, and riding those on the street could
<a href="https://bc.ctvnews.ca/banned-in-b-c-riding-an-e-scooter-could-cost-you-600-1.4470606" rel="external">cost you $600...</a>

It seems a trend that more conferences are moving to San Diego. Personally I wouldn't mind going
there again. It's a very nice place with many interesting attractions.

### Wrapping up

Yet another year another successful GopherCon. This year 1800 gophers attended the conference, the
number of attendees is seeing a steady liner increase since 2014. With improvements on tools, libraries
and the language itself, Go is becoming the first choice for many companies and developers when building
infra platforms, web apps and microservices. With the help from community, Go will continue expanding itself
into more domains like WebAssembly, microcontrollers and machine learning.
