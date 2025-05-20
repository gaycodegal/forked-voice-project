Free 🏳️‍⚧️ Voice Analyzer
======================

This Web-app is an attempt to create a one-stop-shop for transgender voice-training.
At the moment it is still far away from being that, but maybe that will change some day?

Features
--------

Currently the app implements the following features:

* A spectrogram that uses color-coding to highlight the typical gendered vocal ranges.
* A rudimentary marker in the spectrogram of which frequency has the highest amplitude (“is the loudest”).
* An explicit listing of that frequency below the spectrogram.

Technical Features
------------------

* Implemented as a Web-app, therefore fully cross-platform.
* Free and Libre Open Source Software (FLOSS): This project is licensed under a very strong copyleft-license (AGPL) that should help keeping it free.
* All main-functionality is fully implemented on the client-side and that will stay that way.
    * It should be noted though, that this is not an automatic hard pass on optional (!) server-side features if they are useful and can only be reasonably provided by a server-side (for example to track progress over a longer period of time).
* Supports opening from the file-system, without a webserver: Just download the files and open `main.html` in your browser.
* No external dependencies besides typescript and esbuild (the former is in fact optional)
    * This ensures that this will likely be working code in the long run; Any patch that adds NPM-dependencies in particular will not be accepted.
    * If there are important reasons, some components may be written in C++ or Rust; in that case their web-assembly compiler might join this list.

Feedback, Wishes and Patches Welcome
------------------------------------

I have little experience with web-development, so any feedback or pull-requests that improve the code-quality are welcome.

Useful Feature-requests are also welcome, but the harder they are to implement the more their addition will be accelerated by pull-requests. 😉︎
