Free 🏳️‍⚧️ Voice Analyzer
======================

This Web-app is an attempt to create a one-stop-shop for transgender voice-training.
At the moment it is still far away from being that, but consider the large number of trans women in IT and that this is fully open-source that will hopefully change at some point.

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
* No external dependencies besides typescript
    * This ensures that this will likely be working code in the long run; Any patch that adds NPM-dependencies in particular will not be accepted.
    * If there are important reasons, some components may be written in C++ or Rust; in that case their web-assembly compiler might join this list.

Feedpack, Wishes and Patches Welcome
------------------------------------

The original author of this app has extremely little experience with web-development, so any feedback or pull-requests that improve the code-quality (without sacrificing simplicity! There will not be any external dependencies!) is welcome.

Useful Feature-requests are also welcome, but the harder they are to implement the more their addition will be accelerated by pull-requests. 😉︎
