---
layout: post
title:  "Weird Ruby Class Variable"
date:   2024-05-08 15:53:45 +0100
image: /assets/images/classroom.webp
categories: ruby
---


If you had programmed for some time, you would have come across class Variables. Most Programming language has it. It is a variable that belongs to the class itself. Taking the definition from Wikipedia


>A class **variable** is a <a href="https://en.wikipedia.org/wiki/Variable_(computer_science)">**variable**</a> defined in a <a href="https://en.wikipedia.org/wiki/Class_(computer_programming)">**class**</a> of which a single copy exists, regardless of how many <a href="https://en.wikipedia.org/wiki/Instance_(computer_science)">**instances**</a> of the class exist.

Language like C# and Java uses static keywords to define it. But this article is a Ruby(Beautiful Language) article, so let’s see how it is implemented and its weird quirks.

## The Two Ways To Diamond
To show the two ways to implement class variables in ruby, we will implement a class that creates instances and stores how many instances are created from the class. We will also add a class method that prints the number.

### 1. Class Instance Variable (@)
code is as follow:

{% highlight ruby %}
class Fruit
    @instance_count = 0
    
    def initialize
        self.class.increment_instance_count
    end

    def self.instance_count
        @instance_count
    end

    def self.increment_instance_count
        @instance_count += 1
    end
end

Fruit.new
Fruit.new
Fruit.new
Fruit.new

p Fruit.instance_count    #4
{% endhighlight %}

Let’s take a while to explain this code. First, a very important key to note in this code is “*in ruby, everything is an object*”. Objects have instance variables that are private to them.

In the second line, we initialize the class instance variable (not just an instance variable but a class instance) `@instance_count` to zero. Since instance variables are private, we need a function to expose this variable. Hence, we created the `increment_instance_count` class method to increment the instance variable. And `instance_count` to output the instance variable. Lastly, we call the class `increment_instance_count` method in the “initialize” method because it is always called when a new instance is created.

Importantly, something to take note of is the `self.class` in the initialize call.

{% highlight ruby %}
self.class.increment_instance_count
{% endhighlight %}

This is important as `initialize` is in the context of the instance variable. That is self here refers to the instance. So we need the class of the instance and then call `increment_instance_count`.

### 2. Class Variable (@@)
code is as follow:

{% highlight ruby %}
class Fruit
  @@instance_count = 0

  def initialize
    @@instance_count += 1
  end
  
  def self.instance_count
    @@instance_count
  end
end

Fruit.new
Fruit.new
Fruit.new
Fruit.new

p Fruit.instance_count  #4
{% endhighlight %}

This way, we remove some of the complexities of the earlier version. We are using `@@instance_count` which is not private to the class. It is accessible to the instance, hence, we don’t need the `increment_instance_count` method from the earlier version to increment. We can increment it as shown in the initialize method.


{% highlight ruby %}
def initialize
    @@instance_count += 1
end
{% endhighlight %}

### The Weird Quirk
From the two versions, the second way seems to be the way to go for its elegance and simplicity. But there is a caveat. There is something you need to have in mind while using `@@`.


> It is shared across ancestors line

This means that any member of the ancestor has access to change the value and query the value.

From our example, we have a class `Fruit` if call the ancestor as follows

{% highlight ruby %}
p Fruit.ancestors   #[Fruit, Object, Kernel, BasicObject]
{% endhighlight %}

We get an array. If any of these objects in the array edit the value of `@@instance_count`, it will reflect and skew our program.

Currently, none of the objects is changing the value, so our program runs as expected. However, it is worth knowing that ancestors can update/edit the values of class variables.


## CONCLUSION
Ruby is an interesting language that has multiple ways of doing different things. I showed a little hidden fact about class variables that will enable you to choose the right tools while designing your software system.

As always thanks for your time and happy coding.