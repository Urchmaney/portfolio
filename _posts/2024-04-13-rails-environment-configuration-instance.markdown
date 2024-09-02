---
layout: post
title:  "Rails: Environment Configuration (Magical) Instance"
date:   2024-04-13 15:53:45 +0100
image: /assets/images/screw.webp
categories: ruby rails
---

After instantiating your rails application, we have codes generated for us. Let’s focus on a particular section. Focus on the environments section. That is the `config/environments` folder. This folder will contain three files to set up rails behavior in different environments.

Looking at any of these files will bring us to the question we want answers to in this article.

The following is a sample of the file (without the comments).

{% highlight ruby %}
Rails.application.configure do

  config.cache_classes = true

  config.eager_load = true

end
{% endhighlight %}

## The Question
If you look at the code, you will notice something. `config` is being used everywhere. But the question is, Where is `config` coming from? Where is `config` defined?

It seems magical. An ideal scenario would be that `config` was passed as a parameter. Like this.

{% highlight ruby %}
Rails.application.configure do |config|

  config.cache_classes = true

  config.eager_load = true

end
{% endhighlight %}

So why does the original code work without the parameter? Let’s dig a little.

## Unveiling the Trick
First, we need to understand that the `Rails` module object has an `application` instance object which is created when we inherit from `Rails::Application`. This is not in the scope of this article. Trying to explain the first line, why `Rails.application`.

The application instance has a method “configure”. This method is an inherited method from “Rails::Railtie”. You can find the code <a href="https://github.com/rails/rails/blob/92591ebd54e044ff3f3b9d802fe65f69cb7e34f2/railties/lib/rails/railtie.rb#L255" target="_blank">here</a>.

{% highlight ruby %}
def configure(&block) # :nodoc:
    instance_eval(&block)
end
{% endhighlight %}

As you can see from the above code, the method accepts a block as an argument. So the block from the first code block of this article is passed to this argument.

Now we have gotten to the heart of the trick. And it is `instance_eval`.

`instance_eval` is a method that accepts block or string. passing the block to it executes the content of the block as though it was defined in the object.

When the block is running and trying to run `config`, it checks in the application object context and uses it. We can see that `config` was defined in the application instance <a href="https://github.com/rails/rails/blob/92591ebd54e044ff3f3b9d802fe65f69cb7e34f2/railties/lib/rails/railtie.rb#L262C5-L264C8">here</a>.

{% highlight ruby %}
def config
    @config ||= Railtie::Configuration.new
end
{% endhighlight %}

In other words, `instance_eval` gives us a portal into the `application` instance object. So we can use other methods and variables inside the `application` instance object in the block not just `config`.

## Conclusion
I have shown that the reason for this confusing part was because of the `instance_eval` giving us portal access to the application instance. Hope I helped better understand this Rails-generated code and give you confidence in editing it and creating better programs.

As always thanks for your time and happy coding.