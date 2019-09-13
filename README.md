# Tube Masters

In Tube Masters, you play daredevil who is tubing down the side of a mountain.
Pay attention and avoid the obstacles, while trying to get the highest score
possible!

This is a submission for [JS13kGames](https://js13kgames.com/)!

![](/pics/game.png)

## Objective

Dodge the Red obstacles and pick up the green. The yellow pickups are speed
boosts, which will give you 2x points and move you at 2x speed for 2x danger!

## Controls

Use the `Right` and `Left` arrow keys to move around.

>Extra: if you're curious about some stats, use the `escape` key

## Team

Game

__Zack Urben:__ [GitHub](github.com/zackurben), [Twitter](twitter.com/zackurben)

Soundtrack

__Jonathan Darling:__ [GitHub](github.com/jmdarling)


## Postmortem

Following my participation in
[JS13k 2018](https://js13kgames.com/entries/network-hell), I was really eager to
participate again, but I actually forgot about it until I saw the following
tweet:

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Today marks the start of <a href="https://twitter.com/hashtag/js13k?src=hash&amp;ref_src=twsrc%5Etfw">#js13k</a><br><br>a month-long code-golf game-making extravaganza of k.i.s.s.<br><br>Join up! it&#39;s free and you can get real physical prizes like t shirts books and games, thanks to generous sponsors!<br><br>I am a celebrity judge, I promise to be nice<a href="https://t.co/uJ4J77D8fF">https://t.co/uJ4J77D8fF</a></p>&mdash; Christer McFunkypants Kaitila (@McFunkypants) <a href="https://twitter.com/McFunkypants/status/1161281148762374150?ref_src=twsrc%5Etfw">August 13, 2019</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

I didn't officially write code until a few days later, the 18th, and had no clue
what direction to take except for the following: 3D. I decided to make a very
simple attempt at 3D with a simple race/beat the clock/survival game. With the
theme of "Back" I was envisioning tubing down the side of a mountain, trying to
avoid all sorts of obstacles. Admittedly, I had a _hell_ of a time with some of
the rendering and math concepts, as its been awhile since I did this type of 
math - so there was quite a bit of relearning to do. Once I started enjoying it
so much, I deviated from the plan and began simply tinkering with shaders
and modeling stuff in blender to display in my project. Eventually I had to 
pivot when I realized things weren't coming together, which is where we ended
up.

That said, I really enjoyed it, more so than last year, despite only having an
unfinished _game_ (to be generous). Hopefully I'll be back in full force next
year, and not struggling with the basics webgl..!

Having basically zero 3D rendering experience in the past, I was able to make 
_strides_, all thanks to https://webgl2fundamentals.org/ - which lays out the
fundamentals of webgl2 in an easy to digest snippets. I tried to
[repay some of my thanks!](https://github.com/gfxfundamentals/webgl2-fundamentals/pulls?q=is%3Apr+author%3Azackurben+is%3Aclosed)

For the other random sources I used, and found helpful,
[checkout this](/sources.txt).

-Zack
