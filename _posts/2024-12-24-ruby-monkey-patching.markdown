---
layout: post
title:  "Devise: Monkey Patched 'authenticate'"
date:   2024-12-24 08:23:45 +0100
image: /assets/images/monkey.jpg
categories: ruby ruby-on-rails devise
---
# Introduction
Devise, a powerful authentication gem for Ruby on Rails, offers a variety of tools for managing user authentication. Among these is the `authenticate` method, which can be used directly in routing to restrict access to specific resources or paths. This feature allows developers to define access control at the routing level, providing a clean and straightforward way to secure parts of their application. Here is a simple block.
{% highlight ruby %}
Rails.application.routes.draw do
  authenticate :user do
    resources :posts
  end
end
{% endhighlight %}

In this article, we'll explore how the authenticate method seamlessly integrates with the Rails routing block.


# The Problem
One thing to note is that the above code will throw an error if the devise gem is not installed. This indicates that the authenticate method is provided by the devise gem. The question then arises: how do these Devise methods integrate so seamlessly with Rails' structure?



# Prerequisite Knowledge
- Monkey Patching: A way to dynamically modify code behaviour without changing the main source code. Check this <a href="https://blog.appsignal.com/2021/08/24/responsible-monkeypatching-in-ruby.html" target="_blank">article</a> for more understanding.
- Mapper Class: All valid method used in the routes block are found in the <a href="https://github.com/rails/rails/blob/79df80b45873590f827fdd67b485fda4ad2f58b7/actionpack/lib/action_dispatch/routing/mapper.rb#L14" target="_blank">`ActionDispatch::Routing::Mapper Class`</a>. You can find the source for these class <a href="https://github.com/rails/rails/blob/79df80b45873590f827fdd67b485fda4ad2f58b7/actionpack/lib/action_dispatch/routing/mapper.rb#L14" target="_blank">here</a>. The `get`, `post`, `resources` methods are all defined in these class.

# The Answer
As you may already know, at least from the prerequisite section, valid methods in the Rails routing block are defined within the `Mapper class`. If you want to make a method valid inside the routing block, you need a way to register this method in the Mapper class. This is where monkey patching comes into play, and it’s exactly what Devise does. You can find the source code from <a target="_blank" href="https://github.com/heartcombo/devise/blob/fec67f98f26fcd9a79072e4581b1bd40d0c7fa1d/lib/devise/rails/routes.rb#L35">here</a>. Let's also add a short snippet here.

{% highlight ruby %}
module ActionDispatch::Routing
    ...
    class Mapper
        ...
        def devise_for(*resources)
            ...
        end
        ...
        def authenticate(scope = nil, block = nil)
            ...
        end
        ...
    end
end
{% endhighlight %}
You may notice other methods that are equally valid in the Rails routing block when the Devise gem is installed.


# Conclusion
You can see how Devise leverages monkey patching and a deep understanding of Rails to extend its functionality and provide such an elegant API for authentication. This approach demonstrates how you can enhance Rails' capabilities in your own libraries.

Caution: Monkey patching can be a potential source of serious bugs and maintenance challenges. Whenever you use monkey patching in your project, proceed with caution and ensure you have a solid understanding of Rails. Happy coding, and thank you for reading!