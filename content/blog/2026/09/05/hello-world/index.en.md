---
title: "Hello World, sixteen years later"
description: "Sixteen years between failing to install RPG Maker and leading an engineering team. Every door was opened by a game that didn't work out."
date: 2026-09-05
tags: [career, games, ai, writing]
draft: false
---

I turn 31 in ten days. It is not a round number and it is not a milestone, but it is what made me sit down and write this.

It has been sixteen years since my first contact with programming. For most of them what I really wanted was to make games, and it did not happen — I became something else. Looking back now, almost every door that brought me here was opened by a game that did not quite work.

One caveat before I start. I have written before: in 2018 I kept a blog for a whole semester, twenty-two posts, because a professor told me to. Then I stopped for seven years.

The first post on that blog was about a documentary called *Hello World! Processing*. Which makes this one the second Hello World I write.

So this is not the first time I write — it is the first time nobody made me.

## Fourteen, an Ubuntu and a Grand Chase

My first computer came from Casas Bahia — or some similar appliance store, I do not remember. I do not remember the specs either. I remember one thing: it came with Ubuntu, and I complained to my parents endlessly that the thing was unusable.

(Today I am a Linux advocate. My mother, who is a craftswoman, runs Mint because of me.)

What I wanted was to play [Grand Chase][grand-chase]. I was not alone in that: the Brazilian server ended up being the biggest in the world, with a record of 39,500 simultaneous players. So my parents paid a guy from the neighborhood who formatted computers, and he installed a pirated Windows XP on my machine.

It did not go well. Our internet was radio-based, with a huge antenna on the roof, and any wind knocked the antenna out of alignment. I was constantly frustrated by it.

It was around then that I got interested in making games. I downloaded some version of RPG Maker — I cannot remember which, but I think it was not the newest one. For some reason I could not install it. I tried several things I read on forums, nothing. I moved to another one, and that one did not work first try either. I probably do not need to say they were not legitimate copies, right? Maybe that was the difficulty.

I did get into the software. And then: what now?

I did not know where to click, what to write, or how to write it. There were no Indian YouTubers like there are today. There was no AI. There was almost nothing in Portuguese — the little that existed was text, and in English. I would copy things from one site or another; some worked, some did not.

I just got frustrated. It was extremely hard, and I abandoned it for a few years.

## Film school, and an elective called Game Lab

Four years later I decided to study Film and Audiovisual at UFC, the Federal University of Ceará, to my father's disappointment — he thought I was going to be an engineer. He only got the *when* wrong.

To keep it short: the course was not for me. It was specifically the way UFC ran it.

But somewhere in the curriculum, for some reason, there was a course called "Laboratório de Jogos" — Game Lab. A game lab, in a film degree. I went to check while writing this and it is still there, in the [official curriculum matrix][matriz], as a four-credit elective. An elective, which means I chose it.

I was already in my fourth semester and heading into the fifth, which turned out to be the last before I dropped out. I was 20. I signed up to see what would happen.

And there was my nemesis: RPG Maker. Worse this time, because now I had to make something that actually worked.

The course was not good. Quite the opposite. The professor clearly did not want to teach it, probably because she did not know what to do — she was a photography professor, and a good one, but she knew nothing about what it takes to make a game, let alone to program. Still, I remember her trying very hard to help everyone.

The work was in a group, and nobody there really knew what they were doing. My role was the programmer. I was trying to do my best.

Later I checked the system and saw I had passed with a 10, and 100% attendance. I do not remember going to every class. And I remember the game barely worked, even with everything RPG Maker makes easy.

In the end I felt bad about what we handed in.

But that was the course where I gave everything I had. Even having to learn it all on the side, even frustrated — that is what made me keep going. And for some reason that effort opened my eyes to another degree, at the same university: [Digital Systems and Media][smd].

That course is what made me switch. To go toward something where I could express myself through code and stay at least a little involved with creativity, which is what I like.

## SMD, where everything changed

SMD is where everything changed. But I did not get in on the first try: I have always been terrible at the ENEM style of exam, Brazil's national university entrance test, so I spent a year in a prep course before I made it.

SMD stands for Sistemas e Mídias Digitais — Digital Systems and Media. It is a degree almost nobody has heard of, not even here in Brazil. The idea is to sit in the middle: design, programming, audiovisual and games in the same curriculum. The first three semesters are foundations, and after that you pick a track between digital media communication, multimedia information systems and digital games. Human-computer interaction and user experience run through all of it.

Right at the start of the degree came two blows related to development. Both challenged me, and I liked it — they are the reason I stayed in the field.

## Programming I, and a histogram of Gretchen

The less glamorous and more important one was Programming I, with professor Mara — who years later would advise me on a paper I published, about describing and comparing digital games as an aid for teaching programming.

Unlike most introductions to programming at universities and bootcamps, this one was taught in [Processing][processing]. Processing is a language and an environment created in 2001 by Ben Fry and Casey Reas at the MIT Media Lab, with a stated goal: to teach the fundamentals of programming inside a visual context. Programs there are called *sketches*, the syntax is based on Java, and the vocabulary is form, color and geometry.

In practice that meant it was far more fun than staring at a lifeless terminal. There we made circles — or any other geometric shape — get drawn on screen. Much more playful, much more interesting.

I am certain that if most introductions to programming were like that, learning to program would be... well, less hard.

But I keep wondering whether today, in the age of AI, we still need to learn the basics. I do not know. I cannot say. I know it helped me, a lot.

Even though I liked the course, it was not easy. I passed with an 8.2 — one of the lowest grades of my entire degree.

And I will never forget the makeup exam I took after missing one of the tests while I was sick. It was simple, at least by today's standards. One question and an image:

> Draw a histogram for every shade of gray in the Gretchen image in the exam folder.

Today that is trivial. Back then it was tense.

```js
let img;

async function setup() {
  createCanvas(512, 300);
  background(255);
  img = await loadImage('gretchen.png');

  const counts = new Array(256).fill(0);
  img.loadPixels();
  for (let i = 0; i < img.pixels.length; i += 4) {
    const gray = round(
      0.299 * img.pixels[i] + 0.587 * img.pixels[i + 1] + 0.114 * img.pixels[i + 2],
    );
    counts[gray]++;
  }

  const tallest = max(counts);
  stroke(0);
  for (let tone = 0; tone < 256; tone++) {
    const barHeight = (counts[tone] / tallest) * height;
    line(tone * 2, height, tone * 2, height - barHeight);
  }
}
```

That code is not Processing, it is [p5.js][p5] — the reinterpretation of Processing for the web, made by Lauren Lee McCarthy in 2013. I wrote it in p5 because it runs in the browser: you can paste it and watch it work without installing anything. I tested it on version 2.3.2, which is the current one.

## The game I programmed five times

The other blow was more fun: Introduction to Digital Systems and Media.

The grade for that course was the sum of the other four courses of the semester, and what we had to deliver was a game.

I will not go into much detail about the game. It was made in GameMaker, and I swallowed the manual whole to build it. I mean: to build them. I loved programming that thing so much that I programmed my own team's game and at least four other teams'. And I charged nothing. My game's code is scattered across several teams to this day.

My team's was finished two months before the deadline, that is how much I threw myself at it. Finished as in the programming — on screen it was still squares and circles, because there was no art yet.

Our artists did us the favor of sending the final art on the second-to-last day. A friend of mine, the team's other programmer, and I stayed up all night fitting it into the game, because of the other two being irresponsible. We delivered it complete, with the art in place.

That is why I will not dwell on the game. But that experience is what really made me decide on a career in programming.

## The junior enterprise, and something I found out about myself

Still in that second semester I joined the junior enterprise — a student-run company inside the university. I started as a programmer building WordPress plugins and left as a project manager. That experience is where I understood I had a leaning toward management, beyond the hands-on work.

But one thing kept bothering me: game development. I still wanted to work with it. Two semesters later I would go on to found the first game development junior enterprise in Brazil — I think in the world, but that part I cannot prove. It was called, yes, unfortunately called, [TGD Studio][tgd]. The Guardian Dog Studio. I will come back to it.

## The semester that settled it

It was also in that second semester that I wrote the paper with professor Mara, for a peer-reviewed journal. We got an honorable mention.

And it was the semester of Programming II and MAM1 — read it "Mami", Applied Mathematics for Multimedia 1. The two most incredible programming courses that should exist in a university degree.

You can still see most of what I did back then. The professors asked us to log everything on a blog, and [mine is still online][projeto-d]: twenty-two posts, all from the first semester of 2018.

I went back in to write this, and there are things I had already forgotten:

- The first post is from March 2018 and relates examples from the Processing library to the documentary *Hello World! Processing*
- **MAMI 6** was drawing the Brazilian flag according to [Federal Law 5,700][lei]. Proportion, color and star placement are defined by law, and the code had to obey
- **MAMI 4** was taking a program that ran at 1 FPS and making the same program run at 60, without changing its behavior
- **MAMI 12** was Florence Nightingale's rose diagram
- **MAMI 18** was simulating a harmonograph
- And the Programming II one was that drawing app prototype, built with Gabriely Rodrigues: pick the color, four brush shapes, and save as `.jpeg`, `.png` or `.tiff`

The MAMI final project was a remake of *Flash Gordon*, from the 1983 Atari 2600, and I handed it in as a video with my own narration over it. Underneath the video there is a note that caught me off guard reading it now:

> Some of the information I say is wrong, but I corrected it in the captions or in the credits.

In other words: I narrated it, realized afterward that I had said nonsense in a few places, and instead of re-recording I fixed it in the captions and said so. I was 22 and already publishing errata.

MAMI was — and I think still is — the hardest required course in the degree. I passed with an 11.8, and it was not higher only because I failed to hand in one assignment. The professors back then gave assignments worth points directly on the average, so you could go past 10.

That semester is what settled my move into development.

## TGD, and what I learned without programming

I will not cover the whole degree, or every high point. But two of them are worth mentioning.

The first is TGD, which is the project that taught me the most to this day. And there I barely programmed anything beyond the website.

I had to learn how to open a company. I had to go out and find mentors in the industry. We got in touch with people who had been on the first Xbox teams in Brazil, and with AAA game developers. And we shipped a game, which is no longer in stores — but which won Best Game from Ceará.

## The thesis, which was not about programming

The second is my final thesis, which had nothing to do with programming and everything to do with management. I researched the effectiveness of agile methodologies applied to small-scope game development.

The result was: follow the agile method, not an established methodology. Every case is its own case.

## The books, and the first job

At the end of university there were two milestones that started to actually show the results of the knowledge I had built up — not only from the degree, but from studying on my own.

I read a lot. While still at university I had already read *Clean Code* by Uncle Bob, *Refactoring*, *The Pragmatic Programmer*, and other books of that caliber.

I got my first job as a Junior I, and in less than a year I was already a Mid-level III. Not because I learned all of it in a year — when I joined I already had a lot of knowledge. What I was missing was showing it applied.

That is where I started to hate projects without tests. Even without TDD, tests mattered. And mine were very bad: they broke sometimes. Even with the knowledge, I lacked the practice of writing, and writing, and writing.

From the first day to the last the growth was monstrous, and what I left behind was an omnichannel platform with at least a minimum of safety in certain parts.

I was there during the WhatsApp template era. I remember having a phone on the desk just to call WhatsApp and understand why a template had not been approved. It was madness. The company was still starting out, and the owners were learning everything too.

But it was the first time I felt: "hey, what these guys say in these books actually works".

## Teodoro, twenty days

Around the same time I shipped a game on Steam with a colleague: [Teodoro][teodoro]. We made it in twenty days.

It is a sokoban with hand-drawn art, and it came out on March 7, 2021, under CosMonkeys. We made decent money for the effort.

Here I programmed a lot. But I also handled all the marketing, the legal side with Steam, and the finances.

Years later we sold the rights to another company. It is still on the store today, published by Gray Boss.

And it was there that I managed to apply the concepts from the old hands to a project from scratch, and watch the things they talked about actually happen.

## What came next, in three points

From here on it does not make much sense to go point by point. It was much more a consolidation of what the extra reading had taught me, and of applying it. But here are three milestones.

**The global launch campaign for Diablo Immortal.** Bugaboo Studios, where I was, provided services to the company running the launch — but the app was built by us. It recognized a pentagram and took you to the download link, and the campaign opened 6 days, 6 hours and 6 seconds before the game came out. The game came out on June 2, 2022.

I remember watching Rato Borrachudo's livestream drawing the pentagram on his belly with something, lipstick I think. We had not tested that kind of thing, and machine learning was not our specialty. But it ended up working.

**A startup spun off from a mental health hospital.** I joined and soon took the tech lead role — not just for the startup: I moved up to take care of the hospital as well. There we were taking care of lives, so the software was critical. You cannot fail with people's lives. That is where TDD entered my life for good, and the code was already good.

Months later I left the hospital, for internal reasons. Shortly after, it was sold: [Instituto do Câncer do Ceará][icc] bought the startup and the hospital, and hired me to run the technology transition. ICC was founded in 1944 by ten doctors and a priest, and it is the only institution in Ceará on the advisory board of Brazil's National Cancer Institute.

**Today, distributed energy generation.** A manager of solar plants — the largest by number of plants and by beneficiaries served through the plants we manage. I lead a team of 11 people, with zero turnover in nine months. We went from zero tests to more than eight thousand, from three active GitHub projects to more than twenty, and migrated from AWS, Render and other providers to GCP, with a cost reduction. The number of bugs fell along with it.

## AI, and the accusation

Last year I was accused of being against AI. And I was, in several areas.

Until the end of last year, what it generated was garbage. You could use it in a script here and there, but not to build safe, scalable software.

The technology kept changing, and my use of it changed along with it. I am a professional: I have to *be* professional, not just look like one. The tool reached an acceptable level, so my use of it got more intense. Today I sometimes have four chat windows building different solutions or solving problems at the same time.

But I do not trust the generation blindly.

That is why today we do what I always dreamed of doing and had never managed to push to the state of the art that is now possible: sixteen test pipelines, 100% coverage on unit tests and 90% on the rest, lint, and a library I wrote — [archwarden][archwarden] — to make sure the architecture is followed. All of it with developer experience practices applied.

I love it, and I have no problems. My team loves it, and has no problems.

We do not write code anymore. We translate business into specifications, 100% reproducible.

## The MBA, and the school that actually worked

Earlier this year I finished my MBA in Software Engineering at USP.

It is an excellent MBA — but not because I learned a lot there. It was the opposite: I learned very little. And I learned little because I had already been through all the pains they teach you to handle. Business, UX/UI, machine learning, data protection law. I had already seen all of it in SMD and then in professional life.

Almost all the professors are excellent, and the content is condensed but of very high quality. I recommend it, even though it did not help me much.

And in it I went back to games one more time. My thesis was building a game engine, [TYPE][type]. Very far from what I work with today — and even so it taught me more than the rest of the course combined.

That made one thing clear to me: game developers are the elite devs of our field. They have the hardest problems, they have to be more creative, and they are so rarely remembered or recognized outside the games world.

But beyond the venting, it makes something else clear: making games was my best school. And I think it should be the best school for most people — because there you have to be creative and push your brain. It does not have the repetition that building yet another REST application has.

## What I think is coming

I do not know what will become of the new generations of developers. But I believe that, to reach higher levels, they will need to do what I do: be curious from day one. Do not accept the answer someone gives you, even if it comes from a celebrated book — go there, test it, experiment, and refine.

Programmers are not going to disappear. The ones who only liked writing code will. The good ones will have to be more curious about what they solve, about how to build something with good DX for themselves and for the AI, and that still delivers real value to the client.

[grand-chase]: https://www.techtudo.com.br/noticias/2019/02/grand-chase-relembre-sucesso-do-game-que-ganhou-versao-mobile.ghtml
[matriz]: http://www.cinemaeaudiovisual.ufc.br/wp-content/uploads/2013/12/Matriz-Curricular.pdf
[smd]: https://smd.ufc.br/pt/
[processing]: https://processing.org/
[p5]: https://p5js.org/
[projeto-d]: https://projeto-d.weebly.com/
[tgd]: https://br.linkedin.com/company/tgdstudio
[lei]: https://www.planalto.gov.br/ccivil_03/leis/l5700.htm
[teodoro]: https://store.steampowered.com/app/1482130/Teodoro/
[icc]: https://icc.org.br/
[archwarden]: https://github.com/HenriqueArtur/archwarden
[type]: https://github.com/HenriqueArtur/TYPE
