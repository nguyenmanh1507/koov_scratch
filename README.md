# koov_scratch_gui

## temporary static path

http://koov_scratch_gui.surge.sh/media

## Setup

1. Run `git clone git@github.com:nguyenmanh1507/scratch-blocks-custom.git --branch overlay-navigation scratch-blocks`
2. Run `git clone git@github.com:google/closure-library.git` (same folder level at `scratch-blocks-custom`)
3. Inside `scratch-blocks` run `npm i` & `yarn link`
4. Run `git clone git@github.com:nguyenmanh1507/koov_scratch_gui.git --branch overlay-navigation`
5. Inside `koov_scratch_gui` run `yarn link scratch-blocks` & `yarn` & `yarn start`
