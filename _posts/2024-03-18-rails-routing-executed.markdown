---
layout: post
title:  "Rails: When is Routing Executed?"
date:   2024-03-18 15:53:45 +0100
image: /assets/images/road.webp
categories: ruby rails
---

In our rails applications, there is a file where we register all our routes for the application. These may be endpoints for our API application. Or routes to webpages for full-stack applications. This file is the routes.rb file. Which can be found in the path `/config/routes.rb`.

We add paths to this file, and like magic, it’s working. We now have our endpoint `/api/foods` working. We are good to go.

## The Question: When is Rails creating this Routes
A question that might hit you when you are wearing your curiosity hat might be, **When do Rails execute the file?** --- **How does Rails know to check this file for my application routes?**

## The Answer: The Bus
The answer starts from understanding `railties`. This is a link to a <a href="https://api.rubyonrails.org/classes/Rails/Railtie.html">railtie article</a>. At the core of rails, everything is a railtie.

Ok, you understand what is a railtie now, then how does it relate to what we are discussing?

The relationship is that your Rails application itself is a railtie. Your application which is registered in `config/application.rb`.

{% highlight ruby %}
module MedicoBackend
  class Application < Rails::Application
.
.
.
{% endhighlight %}

From the code above, our application only inherits from `Rails::Application`, but `Rail::Application` inherits from `Rails::Engine`, who in turn inherits from `Rails::Railtie`.

So as we can trace our rails application heritage to `Rails::Railtie`, it is a Railtie.

If you understand railtie, we know railtie’s add code to be run during Rails initialization. Since our application is a railtie, it can do just that. And that’s what our Rails application is doing. It adds some codes to run the routing file and adds our routes during application initialization. We can see that if we go to the rails <a href="https://github.com/rails/rails/blob/1b226d574387a44318bc6bebae7670ebd05ea57e/railties/lib/rails/engine.rb#L592C5-L594C19">source code</a>.

{% highlight ruby %}
initializer :add_routing_paths do |app|
  routing_paths = paths["config/routes.rb"].existent
  external_paths = self.paths["config/routes"].paths
  routes.draw_paths.concat(external_paths)
  app.routes.draw_paths.concat(external_paths)

  if routes? || routing_paths.any?
    app.routes_reloader.paths.unshift(*routing_paths)
    app.routes_reloader.route_sets << routes
    app.routes_reloader.external_routes.unshift(*external_paths)
  end
end
{% endhighlight %}

The initializer method call is the way to add an initilization step to rails. Rails uses the above code block to add the initialization step to setup the application routes. And as you can see, rails is checking for the `config/routes.rb` file first before checking for other registered external routes.


## Conclusion
We can see how Rails application uses it feature as a railtie to run code during initialization. And how it checks for that specific file for routes definitions.

We can also add our own custom route file, but that will be another topic.

I hope, I helped clarify the magic of how rails executes the routes file and other little bit of information. Thank you for your time and happy coding.