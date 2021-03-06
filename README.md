# aws-codepipeline-notifications

This is a chrome extension that checks the state of AWS code pipelines and displays them. When a code pipeline stage state changes desktop notifications are shown -- NOT A PRODUCT FROM AWS ITSELF, USE AT YOUR OWN EXPENSE.

How to install?
---------------

 1. Clone this repo to your pc: ```git clone git@github.com:blackwoodseven/aws-codepipeline-notifications.git```
 2. Goto chrome extensions page: ```chrome://extensions/```
 3. Activate "Developer mode" (should be a checkbox that is on the top right of the page)
 4. Click on the button "Load unpacked extension..." (should be under the title of the page)
 5. Locate the folder of this project on your pc and click Load
 6. The extension should be running you can located it by finding the extension named "Pipeline notification" (probably an error message appear saying that you don't have any pipelines defined)
 7. Click on options and on the text-box that is regarding the pipelines's, write the names of the pipeliness you want the extension to look for changes
 8. Its ready to go! If you want to test it goto the AWS code pipelines page and manually release a change and you will be able to see the notifications on the top corner of your screen


Don't forget!
-------------

 * You need to be LOOGED IN to the AWS console for this plugin to work
 * You need to have VISIT ONCE a AWS code pipeline page (ex: https://eu-west-1.console.aws.amazon.com/codepipeline/home)
 * Notification do not appear in fullscreen


How it works?
-------------

So the logic on this extension is each X minutes (defined on the options) it queries the AWS codepipeline web api (like the AWS console web page does) for the state of the api. In order to the api to accept our call we must be logged in to the AWS console, and have accessed one of the code pipelines pages. Once this is done this plugin gets the cookies that regarding the AWS console and send it on the requests generating the CSRF token and sending it as well.


TODOS:
------

 * Manual goto code pipe page needed in order to start getting good responses from the AWS web api (think this is because we cannot set the origin or referrer on our http call)
 * Create package and put this as a public repo in order to others to use


CREDITS:
--------
* Black Wood Seven for providing the resources and manpower https://blackwoodseven.com/
* Icons provided http://www.flaticon.com/authors/maxim-basinski &&
http://www.flaticon.com/authors/plainicon
