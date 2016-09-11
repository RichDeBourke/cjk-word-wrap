CJK Word Wrap
============================

## JavaScript plugin that provides:

* Wrapping each Chinese, Japanese, or Korean (CJK) word in a tag's innerHTML in a `<span class="cjk-wrap"> </span>` set of tags
* With the cjk-wrap class set to white-space: keep-all, words will remain together on the same line (a word will not split mid-character)
    * *This is the standard action for word-break: keep-all, but older Android Internet browsers still in operation do not support keep-all*
* html tags in the original tag (e.g. `<strong>`) are passed through without any change (preserves the original formatting)

## Usage

Add to your style sheet:

~~~~
.cjk-wrap {
  white-space: keep-all;
}
~~~~


Include the plugin and the JavaScript code to call the plugin:

~~~~ javascript
<script src="cjkWrap.js"></script>
<script>
    if (typeof window.cjkWrap === "function") {
        window.cjkWrap("k-box");
    }
</script>
~~~~

Call the plugin for each class that contains CJK text (the plugin processes every html entity with the specified class, but it handles just one class at a time).

##### Soft Hyphens

The html &amp;shy; soft hypehn entity will hyphenate a word styled with word-break: keep-all if the entire word can't fit on a line, but &amp;shy; has no effect with the white-space: nowrap setting.

## Results

Source html that looks like:

~~~~ html
<div class="k-box" lang="ko">
    자동차로 돌아가기 전에 <strong>주차 요금을</strong> 지불하는 것을 잊 마십시오
</div>
~~~~

results in html that looks like:

~~~~ html
<div class="k-box" lang="ko">
  <span class="cjk-wrap">자동차로</span> <span class="cjk-wrap">돌아가기</span> <span class="cjk-wrap">전에</span> <strong><span class="cjk-wrap">주차</span> <span class="cjk-wrap">요금을</span></strong> <span class="cjk-wrap">지불하는</span> <span class="cjk-wrap">것을</span> <span class="cjk-wrap">잊</span> <span class="cjk-wrap">마십시오</span></div>
</div>
~~~~

## Demos

[Simple demo](http://richdebourke.github.io/cjk-word-wrap/simple-demo.html) - demo of the plugin wrapping multiple sections of Korean text

[Evaluation demo](http://richdebourke.github.io/cjk-word-wrap/evaluation-demo.html.html) - demo of the plugin that supports evaluating setting `word-break` to `normal` or `keep-all` and styling the `<span>` tags with `white-space: normal` or `nowrap` to demonstrate the operation of the plugin

Running the Operational demo on different browsers will show which browsers support `keep-all` (if the browser supports `keep-all`, there will be no difference in the word wrapping for `keep-all` and `white-space: nowrap`).

## Why wrap Chinese, Japanese, and Korean text in span tags

The default browser standard for English words (as well as words in other languages that use Latin characters) is to split the text at a space when a line of text is longer than the width of the text space.

The default browser standard for Chinese, Japanese, and Korean words is to split a word between any space or character when a line of text is longer than the width of the text space.

Splitting between characters is not always acceptable way of laying out text. Based on the post, [Cardinal Rules of Korean-Language Layout](http://nojeokhill.koreanconsulting.com/2013/05/korean-translation-tip-cardinal-rules-of-korean-language-layout.html):

* Justified Korean text can be split anywhere, at a space or within a word
* Left aligned Korean text should only be split between words

*My interest in text formatting is limited to English and Korean. I have not researched line splitting requirements for Chinese and Japanese text.*

The [`word-break: keep-all;`](https://drafts.csswg.org/css-text-3/#word-break-property) property, which can keep Korean words from splitting between characters, was added to the CSS3 specification around 2011. As of 2015, all of the *latest* major browser versions support `keep-all`.

The problem is not all Android phones run the *latest* version of the Android Internet browser. The default browser that comes with Android phones does not get updated the way other apps do. This leaves a number of potential visitors with a browser that doesn’t support keep-all, which could result in some visitors having a different experience from what was designed.

#### Long term

I started wrapping Korean words in `<span>` tags in 2013 (using a jQuery based plugin) to control word splitting, as at that time, several browsers (e.g. Chrome) did not support `keep-all`. In 2015, Webkit was updated to support `keep-all` (at which time I converted to a JavaScript based plugin), so now about 95% of the visitors to my site are using a browser that supports `keep-all`. CJK word splitting eventually can be controlled by the keep-all setting without the need for using the nowrap style, once most of the phones that are running older versions of Android Internet browser are replaced.

## Compatibility

The CJK Word Wrap plugin is compatible with:
* IE 9, 10, & 11
* Edge (desktop & Surface)
* Chrome (mobile & desktop)
* Firefox
* Android Internet
* Safari (mobile & desktop)

*Note: The plugin does not work with IE 8 and below as those versions of IE do not support the JavaScript getElementsByClassName and trim functions.*


## License
This plugin is provided under the [MIT license](http://opensource.org/licenses/mit-license.php).

