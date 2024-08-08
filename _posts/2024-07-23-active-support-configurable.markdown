---
layout: post
title:  "Active Support: Configurable"
date:   2024-07-23 15:53:45 +0100
image: /assets/images/configuration.webp
categories: ruby
---

Most of us, as Rails developers, have used gems, and we need to set some configurations for the gem. let’s pick a gem for example. Let’s use `Kaminari`. A rails gem for pagination. we can set `default_per_page` config property as follows:

{% highlight ruby %}
 Kaminari.configure do |config|
  config.default_per_page = 10
 end
{% endhighlight %}

in Rails initializers folder.

And we can now access this configuration as follows:

{% highlight ruby %}
  Kaminari.default_per_page
{% endhighlight %}

With all this, we can ask the question `How is this implemented from the Gem standpoint?` and, `How does ActiveSupport::Configurable help?`

To kick off, let’s implement this without active support.

## Without Support
Let’s implement the configuration structure. You can also see how Kaminari implements theirs by following this <a href="https://github.com/kaminari/kaminari/blob/master/kaminari-core/lib/kaminari/config.rb">link</a>.

{% highlight ruby %}
  module Kaminari
    class Configuration
      attr_accessor :default_per_page
    end
  end
{% endhighlight %}

We created the Kaminari module with `Configuration` class in it. the Configuration class has the `default_per_page` property.

next, let’s add the module method/instance that will hold the configuration instance.

{% highlight ruby %}
  module Kaminari
    class Configuration
        attr_accessor :default_per_page
    end

    class << self
      def configuration
        @config ||= Configuration.new
      end
    end
  end
{% endhighlight %}

With this instance created, what’s left, is to create an API that users will use to set configurations. For this, we create the `configure` method.

{% highlight ruby %}
  module Kaminari
    class Configuration
        attr_accessor :default_per_page
    end
    
    class << self
      def configuration
        @config ||= Configuration.new
      end

      def configure
        yield configuration if block_given?
      end
    end
  end
{% endhighlight %}

Awesome, we have created the configuration setup. We can now set the configuration value for our module.

{% highlight ruby %}
  Kaminari.configure do |config|
    config.default_per_page = 20
  end
{% endhighlight %}

Nice. Let’s access the configuration value for `default_per_page` which we just set. We do this as follows:

{% highlight ruby %}
  Kaminari.configuration.default_per_page   #20
{% endhighlight %}

But one thing we will notice is that `configuration` is in the path. This is unnecessary (arguable). We can fix this by using ruby metaprogramming `method_missing` method. Let’s define it.

{% highlight ruby %}
  module Kaminari
    class Configuration
        attr_accessor :default_per_page
    end
    
    class < self
      def configuration
        @config ||= Configuration.new
      end

      def configure
        yield configuration if block_given?
      end

      def method_missing(m, *args, &block)
        return configuration.send(m, *args, &block) if configuration.respond_to?(m)
        super
      end  
    end
  end
{% endhighlight %}

With the `method_missing` defined, we can now go ahead and access the value directly. as follows:

{% highlight ruby %}
  Kaminari.default_per_page    #20
{% endhighlight %}

pheeeewwwww. Ok, now that’s all for creating the configuration setup without active support.


## Active Support

Ok, we have seen how to implement the configuration setup without active support, let’s see the other side.

First, you install the `active_support` gem. You can see how here. let’s write our module.


{% highlight ruby %}
  require "active_support/configurable"

  module Kaminari
    include ActiveSupport::Configurable
  end
{% endhighlight %}

With the above code, we can set our configuration value and call it. as follows

{% highlight ruby %}
  Kaminari.configure do |config|
    config.default_per_page = 80
  end
{% endhighlight %}

And call the value as follows:

{% highlight ruby %}
  Kaminari.config.default_per_page     #80
{% endhighlight %}

Two things to note. We are using `config` in the path in the above code. Not `configuration` that we used in our setup. This is because that’s what active_support chooses to name theirs.

Secondly, as we said earlier, having `config` in the path to call the value is unnecessary. Let’s fix that with the following code.

{% highlight ruby %}
  require "active_support/configurable"

  module Kaminari
    include ActiveSupport::Configurable
    
    config_accessor :default_per_page
  end
{% endhighlight %}


With the following fix, we now call the value as :

{% highlight ruby %}
  Kaminari.default_per_page        #80
{% endhighlight %}
Which is our goal. Nice!!!

We can see how active support configurable does some heavy lifting for us.

## Conclusion

I went through this to show you how active support configurable helps in configuring your gem, module, or class.

There are other things that active support gives. One of which is instances of configurable classes also have access to the config object.

You choose which method you would go with.

Thanks for your time and attention. Keeps coding.
