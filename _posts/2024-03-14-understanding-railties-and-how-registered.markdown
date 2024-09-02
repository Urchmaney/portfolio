---
layout: post
title:  "Rails: Understanding Railties and How it’s Registered"
date:   2024-03-14 15:53:45 +0100
image: /assets/images/rails_railties.webp
categories: ruby rails
---

If you have ever worked with Rails, you would have seen the application file. Located in the config folder (/config/application.rb). This file is where we register rails gems that need to load some code on rails initialization. These files are called `Railties`

{% highlight ruby %}
require_relative 'boot'

require "rails"
# Pick the frameworks you want:
require "active_model/railtie"
require "active_job/railtie"
require "active_record/railtie"
require "active_storage/engine"
require "action_controller/railtie"
require "action_mailer/railtie"
require "action_mailbox/engine"
require "action_text/engine"
require "action_view/railtie"
require "action_cable/engine"
# require "sprockets/railtie"
require "rails/test_unit/railtie"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module MedicoBackend
  class Application < Rails::Application
.
.
.

{% endhighlight %}

In a scenario where you want to load some code during rails initialization, you can consider writing your own railtie. You can use this <a href="https://api.rubyonrails.org/classes/Rails/Railtie.html">article as a guide</a>.

## The Question: Billion Ruby One
When we see this file, we add our railties there and be done with it. But, how about we ask, how is it possible that Rails can run the code with just requires to class definitions? Where is Rails initializing these classes? Is Rails checking this specific folder?

Let’s try to answer these questions and have clarity.

## The Starting Point: On your Mark

The genesis of answering this question is from the environment file. Which is also located in the config folder *(/config/environment.rb)*. This file calls the application file and *initialize!* function.

{% highlight ruby %}
# Load the Rails application.
require_relative 'application'

# Initialize the Rails application.
Rails.application.initialize!
{% endhighlight %}

The first line calls the file which registers all the railties. The file that made us interested in this article.

## The intialize!: Rabbit Hole
The second line is the start of the rabbit hole. this line calls the *initialize!* method defined in Rails source code. It is defined in the Application class which our application inherits from. <a href="https://github.com/rails/rails/blob/93b89b170bbfabb7c456950512845a0fc68ba002/railties/lib/rails/application.rb#L424C4-L429C8">the source</a>.

{% highlight ruby %}
def initialize!(group = :default) # :nodoc:
    raise "Application has been already initialized." if @initialized
    run_initializers(group, self)
    @initialized = true
    self
end
{% endhighlight %}

As you can see, *intialize!* method in turn calls the *run_initializers*. this method is in a module file in Rails. it is accessible to this call because the superclass (Rails::Railtie) included the module in its definition. <a href="https://github.com/rails/rails/blob/93b89b170bbfabb7c456950512845a0fc68ba002/railties/lib/rails/initializable.rb#L58">the source</a>.

{% highlight ruby %}
def run_initializers(group = :default, *args)
    return if instance_variable_defined?(:@ran)
    initializers.tsort_each do |initializer|
    initializer.run(*args) if initializer.belongs_to?(group)
    end
    @ran = true
end

def initializers
    @initializers ||= self.class.initializers_for(self)
end
{% endhighlight %}

Moving forward. As you will notice in the earlier block of code, I added another method initializers. I added that because it caused me a whole lot of confusion. Let me explain.

In the method run_initializers, we call initializers. You would think that the method I added was what is being called, but it is not. Ideally, you would be correct but, Application class has overridden this method. So the other method was what was being called. <a href="https://github.com/rails/rails/blob/93b89b170bbfabb7c456950512845a0fc68ba002/railties/lib/rails/application.rb#L431">the source</a>.

{% highlight ruby %}
def initializers # :nodoc:
    Bootstrap.initializers_for(self) +
    railties_initializers(super) +
    Finisher.initializers_for(self)
end
{% endhighlight %}

This caused me a lot of frustration. This method then calls the *railties_initializers* method. <a href="https://github.com/rails/rails/blob/93b89b170bbfabb7c456950512845a0fc68ba002/railties/lib/rails/application.rb#L635">the source</a>.

{% highlight ruby %}
def railties_initializers(current) # :nodoc:
    initializers = []
    ordered_railties.reverse.flatten.each do |r|
    if r == self
        initializers += current
    else
        initializers += r.initializers
    end
    end
    initializers
end
{% endhighlight %}

*railties_initializers* method calls *ordered_railties* method. <a href="https://github.com/rails/rails/blob/93b89b170bbfabb7c456950512845a0fc68ba002/railties/lib/rails/application.rb#L613">the source</a>.

{% highlight ruby %}
def ordered_railties # :nodoc:
    @ordered_railties ||= begin
    order = config.railties_order.map do |railtie|
        if railtie == :main_app
        self
        elsif railtie.respond_to?(:instance)
        railtie.instance
        else
        railtie
        end
    end

    all = (railties - order)
    all.push(self)   unless (all + order).include?(self)
    order.push(:all) unless order.include?(:all)

    index = order.index(:all)
    order[index] = all
    order
    end
end
{% endhighlight %}

Following the pattern, *ordered_railties* then calls *railties* method. the call is on the line 13 *(all = (railties — order))*. <a href="https://github.com/rails/rails/blob/4bb73233413f30fd7217bd7f08af44963f5832b1/railties/lib/rails/engine.rb#L496">the source</a>.

{% highlight ruby %}
def railties
    @railties ||= Railties.new
end
{% endhighlight %}

At last, we meet the real culprit. *Railties.new*. This code is initializing a class. Let see the class. <a href="https://github.com/rails/rails/blob/main/railties/lib/rails/engine/railties.rb">the source</a>.


{% highlight ruby %}
# frozen_string_literal: true

module Rails
  class Engine < Railtie
    class Railties
      include Enumerable
      attr_reader :_all

      def initialize
        @_all ||= ::Rails::Railtie.subclasses.map(&:instance) +
          ::Rails::Engine.subclasses.map(&:instance)
      end

      def each(*args, &block)
        _all.each(*args, &block)
      end

      def -(others)
        _all - others
      end
    end
  end
end
{% endhighlight %}

From the class, you can see in the *initialize* method, that Rails is calling the subclasses method of *Rails::Railtie*. Which, if you remember is a pre-requisite of creating a railtie. the *subclasses* method will return all the classes we registered. Instantiate it by calling the instance method on it and then rails run the codes you add on it.

> NB: The subclasses method is defined in rails (ActiveSupport). But as of ruby 3.1, ruby have added subclasses to classes. Another article to dig into that.

## Conclusion: Climb Out

It’s time we climb out of the rabit hole. We can see that rails is using the base class to fetch all the subclasses and then initialize them and run code in them. So no, rails is not checking a specific folder.

Thanks for your time and happy coding.