---
layout: post
title:  "Ruby: Rescue Constant ($!)"
date:   2024-04-22 15:53:45 +0100
image: /assets/images/exception.webp
categories: ruby
---

Have you ever handled exceptions in your ruby code? If so, then you would have come across `rescue`. Let’s see an example for a refresher.

{% highlight ruby %}
def handle_exception
  raise "The exception"
rescue
  p "Exception Rescued"
end


handle_exception      #=> Exception Rescued
{% endhighlight %}

If we run the following code, we get `Exception Rescued` on our terminal. That’s self-explanatory.

But what if we want to use some properties of the exception inside the rescue block? Let’s say we want to print out the exception message rather than `Exception Rescued`. One way to do that would be as follows:

{% highlight ruby %}
def handle_exception
  raise "The exception"
rescue => e
  p e.message
end

handle_exception      #=> The exception
{% endhighlight %}

This way, we are assigning the exception into the variable `e` and printing out the message to the console.

> As a note, it is advised to specify the exact exception you are catching for better code.
>
> In this case: `RuntimeError`

### Constant Way

Another way of achieving this is to use the ruby `$!` constant as follows:
{% highlight ruby %}
def handle_exception
  raise "The exception"
rescue
  p $!.message
end

handle_exception      #=> The exception
{% endhighlight %}

You will notice that the `e` variable is no longer there. we can access the exception from the `$!` constant. This constant is always nil when used anywhere else in your ruby code. It only always has a value within the rescue block.

This is a nice tip to have while writing or reading code. Thanks for your time and happy coding.
