# UWC SupportCanvas

UWC SupportCanvas is the widget which was created according the task on [UA Web Challenge III](http://iii.uwc.org.ua/)

A simple JavaScript widget for integration support. The user clicks on the link/button/all-that-you-want and chat appears. Sapport can see user's viewport and can show where to click to the user. 

To synchronize the user's browser with support will be used a simple API based on NodeJS and Socket.IO which you find here [socketAPI](https://github.com/delros/socketAPI)

According the task, for simplicity, assume that we have 1 user and 1 support user

## Want to see in live?

Not now, but it will be published

## What does it do?

* Includes to the document realtime chat instance with support
* Implements the posibility to render HTML to canvas (using the [html2canvas](https://github.com/niklasvh/html2canvas)) and send it to the support
* Support can see received client's screendump and show user where he can find some missed thing

## How to use it?

You can place this code on any page you have to initialize the support widget

    <script src="http://[*apipath*]/src/app.js"></script>
    <script type="text/javascript">
      $(document).ready(function () {
        wgt.setup({
          name: 'James Willson'
        });
      });
    </script>

Note that [*apipath*] is the path to you server API, by the default it is http://localhost:8001/
