# ![GatherMySteps](docs/gms-title.png)

GatherMySteps is a web application (UI component) to process personal GPS tracks. It provides a track editor and a semantic editor.

The processing is divided into three stages: preview, adjust, and annotate. Tracks are grouped by days, for each day, it is possible to preview (and make changes) before advancing to the adjust stage. Tracks are sent back to the [server](https://github.com/ruipgil/processmysteps) where they are [transformed into trips](https://github.com/ruipgil/GatherMySteps). At the adjust stage, just like when previewing, the tracks (now trips) can be validated or changed to better represent the day being processed. Finally, in the annotate stage, users can annotate their day with personally relevant information.

You can check out the standalone editor, GPXplorer, at [http://ruipgil.com/GatherMySteps](http://ruipgil.com/GatherMySteps).

## Run

There are several ways to run GatherMySteps

+ Download the latest build from [GatherMySteps](https://github.com/ruipgil/GatherMySteps/releases), extract and open the ``` index.html ``` file.
+ Clone and install, then run the code
  - Compile (once) & run:

    ```
      npm run build
    ```

    Open the file at ``` build/index.html ```
  - Run as a server (with hot-loading):

    ```
      npm run dev
    ```

    Open the browser at ``` http://localhost:8080 ```

### Clone and install

```
git clone https://github.com/ruipgil/gathermysteps
cd gathermysteps
npm install --save-dev
```

> Note that GatherMySteps is the **UI component** of the system!
> You'll need to install and run [ProcessMySteps](https://github.com/ProcessMySteps).

## Technical Overview

GatherMySteps is essentially a track editor -- that allows the manipulation of GPS tracks -- and a semantic editor.
All the information is fetched from the [server](https://github.com/ruipgil/processmysteps), it also manages the progression of the application.

We use React and Redux to display information and propagate state changes. The root state of our application is an [immutable map](https://facebook.github.io/immutable-js/docs/#/Map) with the keys:
```js
{
  // display map data
  'map': {
    // last user defined bounds. Update to fit bounds
    'bounds': <BoundsRecords>,
    // last user defined center
    'center': { lat, lon },
    // array with ids of highlighted segments
    'highlighted': []
    // array with points highlighted
    'highlightedPoints': [],
    // callback for click
    'pointPrompt': null,
    // map provider
    'provider': 'OSM_VANILLA'
  }
  // last information received from the server
  'progress': {
    // day being processed
    'daySelected': '2016-10-02',
    // life received
    'life': '',
    // remaining tracks/days to be processed
    'remainingTracks': [],
    // server address
    'server': 'http://localhost:5000',
    // stage of processing (preview, adjust, annotate)
    'step': 0
  },
  'tracks': {
    // undo & redo history of tracks/trips
    'history': {
      'future': [...],
      'past': [...]
    },
    // map of segments, where the key is the id of the segment
    'segments': {
      '0': <SegmentRecord>
      // ...
    }
    // map of tracks, where the key is the id of the track
    'tracks': {
      '0': <TrackRecord>
      // ...
    }
  // ui stuff
  'ui': {}
}
```

Records and complex data structures reside in [``` src/records ```](./src/records/index.js). The actions and reducers are also organized around the structure presented above. From those, I'd highlight [segments reducers](./src/reducers/segments.js) which apply the logic necessary to execute actions such as split, join, or edit a segment.

### Track Editor (aka [GPXplorer](http://ruipgil.com/GatherMySteps))

![Track Editor Screenshot](docs/track-editor.png)

The track editor, used in the preview and adjust stages, is of the main modules of our system. It allows to edit tracks (and trips) with a fine grain of detail.
It displays tracks on a map and in a side pane, for better navigation and identification of the tracks being processed.
It is comprised of several components/containers. [` Map `](./src/map) and [` TrackPane `](src/containers/TrackPane) are its main components.

Some of the actions of the track editor are the following:
+ Remove a track segment
+ Create a new track segment
+ Edit points individually
+ Split a track segment into two
+ Join two track segments into one
+ Inspect points
+ Undo/redo actions

Tracks may have thousands of points, which make [naive undo/redo](http://redux.js.org/docs/recipes/ImplementingUndoHistory.html) of destructive actions memory intensive or even impossible. To prevent that, instead of storing the entire state (to later restore), we store a revert function that generally accepts a few parameters and has a small memory footprint. For instance, the join track stores an undo function that is similar to the split of the resulting segment, in the point joined.

### Semantic Editor

![Semantic Editor Screenshot](docs/semantic-editor.png)

The semantic editor harnesses the power and flexibility of plain text editing, with the help of personally relevant suggestions and syntax highlighting. In fact, the semantic editor was inspired by IDEs. The annotation follow the [LIFE format](https://github.com/domiriel/LIFE).

We have developed [a PEG parser](src/Editor/life.peg.js) (using [`PEGjs`](http://pegjs.org/)) that implements the specification and builds an AST. With the AST and the tracks/trips (received from the server) we are able to [associate the LIFE annotations with the tracks](src/Editor/buildLifeAst.js).

We use [Draft.js](https://facebook.github.io/draft-js/) to manage, decorate the semantic editor.

### Map

Both the track editor and the semantic editor are supported by the [map component](src/map/index.jsx). We implemented a custom wrapper around [Leaflet](leafletjs.com) that taps into our internal structure, allowing us to fine tune the performance. It was designed to support the following features:
+ display/hide track segments
+ handle changes in segments (join, split, and point editing)
+ manage overlays over segments

## Parallel projects

[*GatherMySteps*](https://github.com/ruipgil/GatherMySteps) is a webapp, that doubles as a track editor and semantic annotator. It is supported by [*ProcessMySteps*](https://github.com/ruipgil/ProcessMySteps), a python backend application that uses *TrackToTrip*.

[*GPXplorer*](http://ruipgil.com/GatherMySteps) is the track editor-only fork of [*GatherMySteps*](https://github.com/ruipgil/GatherMySteps)

These three projects are part of my master thesis.

## License
[MIT](./LICENSE)
