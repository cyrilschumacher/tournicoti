# tournicoti

> Automatically rotate URLs in a full screen application.

*tournicoti* is an Electron application that displays web pages, turn-by-turn, according to a given timeout. The application has been thought to be displayed on a medium where metrics are displayed.

## Getting Started

This application starts at the command line, declaring URLs as follows:

```bash
./tournicoti -- http://page1 http://page2
```

The application offers the possibility of setting options to configure the timeout:

```bash
./tournicoti -- -timeout "60s" http://page1 http://page2
```