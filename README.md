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

Blockee is already ready to host on your own Heroku instance. When deploying to Heroku, your javascript and css will be automatically concatenated/compiled for faster loading. You can do the typical heroku create, git push heroku master steps to push the site to your heroku app.
    
To test this concatenated/compilation release locally, run:

    $ bbb clean release monolithic:release
    
This will remove any previously compiled static assets, re-compile static assets, then start your local testing server (but using compiled assets, not development ones). Now visit [http://localhost:8000/](http://localhost:8000/).

### Thanks!

Thanks for considering Blockee for your community visualization and planning needs! Blockee is here for YOU!!!

#####Another civic project by:

![Mou icon](http://codeforamerica.org/wp-content/themes/cfawp2012/images/logo.png)



###License

Copyright (c) 2012, Code for America.
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name of Code for America nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
