node-red-contrib-ui-media
=====================
A Node-RED UI node to show media files (image and video) on the dashboard.

This node was created by [Smart-Tech](https://netsmarttech.com) as part of the [ST-One](https://netsmarttech.com/page/st-one) project.

Install
-----------

You can install this node directly from the "Manage Palette" menu in the Node-RED interface. For now, the required modules are on this repository, but we'll be listed here
in the future.

Alternatively, run the following command in your Node-RED user directory - typically `~/.node-red` on Linux or `%HOMEPATH%\.nodered` on Windows

        npm install node-red-contrib-ui-media

Usage
-----------

Each media node can show one media item at a time.
![](/images/example_pic.png)
To upload an image or a video you first must go to the File tab. Then you 'll click the icon to the right of the Category dropdown menu (left pic) and  will give it a name like on the example (right pic). Finally, click on the check icon to create a new media category. Categories don't discriminate between file types, so you might have an image and a video on the same category.

| ![](/images/example_create_category_1.png) | ![](/images/example_create_category_2.png) |
|:--------------------------------------:|:----------------------------:|

After creatilng, or selecting the category that you want, click on the icon right to the File dropdown menu (left pic). Click on "Browse" to navigate through your directories, select a file and click Open. An upload icon will appear, click on it to upload your file to your category folder.

| ![](/images/example_create_category_3.png) | ![](/images/example_create_category_4.png)|
|:--------------------------------------:|:----------------------------:|

In general, categories and files will be saved at `<path to your node-red folder>/lib/<name of your project>`. When the project resource is enabled on your Node RED settings, they will be saved on the project directory. Finally, you can select an image from the dropdown menu and preview it on the edit tab.

![](/images/example_create_category_5.png)

Bugs and enhancements
-----------

Please share your ideas and experiences on the [Node-RED forum](https://discourse.nodered.org/), or open an issue on the [page of the project on GitHub](https://github.com/netsmarttech/node-red-contrib-ui-media)

License
-----------
Copyright 2019 Smart-Tech, [Apache 2.0 license](LICENSE).
