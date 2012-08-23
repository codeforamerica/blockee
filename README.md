![Mou icon](https://s3.amazonaws.com/blockee/blockee_logo_static.png)

### What is Blockee?

Have you ever wondered what the street you live on would look like with a bike lane? How about a playground or a community garden instead of that parking lot? Did you then wonder what it would look like if all of those things sparkled?

Blockee is a place where you can bring your wonders to life! Explore, reimagine, and recreate your community!

### Does Blockee actually exist?

Yes! And you can see it running [here](http://blockee.org). However, it is in active development and changing constantly - not all the planned features exist yet. But, stay tuned to this repo and watch for changes. Even better, contribute to Blockee's development - we love feature and pull requests!

### How do I run Blockee on my machine?

*Note: This is a bit technical and not required unless you want to run Blockee on your own deveopment machine and contribute to development. If you just want to USE Blockee, go [here](http://blockee.org)!*

###### Bleeding edge Rockstar tech!
Blockee is a [node.js](http://nodejs.org/) application that uses [backbone.js](http://backbonejs.org/) for structure. Specifically, it uses bocoup's [Backbone Boilerplate](http://weblog.bocoup.com/introducing-the-backbone-boilerplate/). As a Backbone Boilerplate project, it employs [grunt](https://github.com/cowboy/grunt) and [grunt-bbb](https://github.com/backbone-boilerplate/grunt-bbb) to manage builds and the local, node test server. The following instructions assume you are on a Mac running OSX Lion with  [Homebrew](http://mxcl.github.com/homebrew/) installed. All of the commands are to be run from your shell command line prompt.

###### Installing the pre-reqs 

First get node:

*Note: To make sure you get the latest version of everything (usually a good idea), make sure to run brew update before issuing the following commands*

    $ brew install node

Then, get the node package manager (npm)

    $ curl http://npmjs.org/install.sh | sh
    
Ensure that node and npm have installed properly. You should be able to issue the following commands and see a similar reponse (your exact version numbers might be differnt than what is shown here):

    $ node --version
    v0.6.6
    $ npm --version
    1.1.2
    
 If you see something like that then you are good to go! If not, search the webs and ask your javascript nerd friends for help with your node and npm installs!
    
###### Installing Blockee

Now that you've got node, you need only clone this Blockee repo and issue some simple bbb comands to run your local server. Here's how:

    $ git clone https://github.com/codeforamerica/blockee.git
    $ cd blockee
    $ npm install # install node packages from listed package.json
    $ bbb monolithic # run the site in devel mode on port 8000
    
After the last step, you should see something like this on your console:

    Running "monolithic" task
    starting monolithic server
    /Users/yourusername/blockee
    Doing that listening on http://0.0.0.0:8000

If you do, that's a good thing! Because, now you can go to [http://localhost:8000/](http://localhost:8000/) in your browser and check out the Blockee you've just unleased.

### Hosting on Heroku

Blockee is actually ready to host on your own Heroku instance. The Procfile defines a web worker that assumes you've created a release distribution of Blockee. To create a release run the following grunt command:

    $ bbb clean
    $ bbb release

This will remove/update the dist/release files with any changes you might have made. Now you can do the typical heroku create, git push heroku master steps to push the site to your heroku app.
    
To test your release locally, run the site via the Procfile (this assumes you are somewhat familiar with heroku and have foreman installed). Specifically, run:

    $ foreman start

### Thanks!

Thanks for considering Blockee for your community visualization and planning needs! Blockee is here for YOU!!!

#####Another civic project by:

![Mou icon](http://codeforamerica.org/wp-content/themes/cfawp2012/images/logo.png)
