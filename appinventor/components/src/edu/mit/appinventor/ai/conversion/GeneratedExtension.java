// AUTO-GENERATED FROM blocks.json
// -*- mode: java; c-basic-offset: 2; -*-
package edu.mit.appinventor.ai.conversion;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import java.util.concurrent.Semaphore;

import com.google.appinventor.components.annotations.*;
import com.google.appinventor.components.common.ComponentCategory;
import com.google.appinventor.components.runtime.*;

@DesignerComponent(
        version = 1,
        description = "Auto-generated wrapper around Scratch extension",
        category = ComponentCategory.EXTENSION,
        nonVisible = true,
        iconName = "")
@SimpleObject(external = true)
public class GeneratedExtension extends AndroidNonvisibleComponent {

    private final Activity activity;
    private final WebView webView;
    private final Semaphore semaphore = new Semaphore(0);
    private double jsResult_double;
    private String jsResult_string;
    private String currentFunction = "";

    public GeneratedExtension(ComponentContainer container) {
        super(container.$form());
        this.activity = container.$context();

        webView = new WebView(activity);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new JSBridge(), "AndroidBridge");
        LoadHTML("\n<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <title>Extension WebView</title>\n</head>\n<body>\n  <script src=\"src/edu/mit/appinventor/ai/conversion/assets/ExtensionFramework.js\"></script>\n  <script src=\"src/edu/mit/appinventor/ai/conversion/assets/simpleprg95grpexample.js\"></script>\n  <script>\n    setTimeout(() => { window.test = new window.simpleprg95grpexample.Extension(); }, 2000);\n  </script>\n</body>\n</html>\n");
    }

    @SimpleFunction(description = "Load HTML into the internal WebView")
    public void LoadHTML(String html) {
        webView.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
    }

    @SimpleFunction(description = "Call JS and wait for double")
    public double RunJSAndWait_Return_double(final String js) {
        jsResult_double = -1;
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() { webView.evaluateJavascript(js, null); }
        });
        try { semaphore.acquire(); } catch (InterruptedException e) { return -1; }
        return jsResult_double;
    }

    @SimpleFunction(description = "Call JS and wait for string")
    public String RunJSAndWait_Return_string(final String js) {
        jsResult_string = "";
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() { webView.evaluateJavascript(js, null); }
        });
        try { semaphore.acquire(); } catch (InterruptedException e) { return ""; }
        return jsResult_string;
    }

    @SimpleFunction(description = "Run JS asynchronously")
    public void RunAsyncJS(final String js) {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() { webView.evaluateJavascript(js, null); }
        });
    }

    @SimpleFunction(description = "Run JS and wait (no return)")
    public void RunJSAndWait(final String js) {
        jsResult_double = 0.0;
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() { webView.evaluateJavascript(js, null); }
        });
        try { semaphore.acquire(); } catch (InterruptedException e) {}
    }

    private static String escapeJSString(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private class JSBridge {
        @JavascriptInterface
        public void setResult_double(String fnName, double value, String type) {
            jsResult_double = value;
            semaphore.release();
        }

        @JavascriptInterface
        public void setResult_string(String fnName, String value, String type) {
            jsResult_string = value;
            semaphore.release();
        }

        @JavascriptInterface
        public void setResult(String fnName, Object value, String type) {
            semaphore.release();
        }
    }

    // AUTO-GENERATED METHODS FROM blocks.json
    
  @SimpleFunction(description = "Wrapper for log")
  public void Log(String value) {
      RunJSAndWait("window.test.log(\"" + escapeJSString(value) + "\")");
  }

  @SimpleFunction(description = "Wrapper for indicateMessage")
  public void IndicateMessage(String value, double time) {
      RunAsyncJS("window.test.indicateMessage(\"" + escapeJSString(value) + "\", " + time + ")");
  }

  @SimpleFunction(description = "Wrapper for dummyUI")
  public void DummyUI() {
      RunJSAndWait("window.test.dummyUI()");
  }

  @SimpleFunction(description = "Wrapper for counterUI")
  public void CounterUI() {
      RunJSAndWait("window.test.counterUI()");
  }

  @SimpleFunction(description = "Wrapper for colorUI")
  public void ColorUI() {
      RunJSAndWait("window.test.colorUI()");
  }

  @SimpleFunction(description = "Wrapper for imageBlock")
  public void ImageBlock(Object jibo) {
      RunJSAndWait("window.test.imageBlock(" + jibo + ")");
  }

  @SimpleFunction(description = "Wrapper for giveString")
  public String GiveString(String jibo) {
      return RunJSAndWait_Return_string("window.test.giveString(\"" + escapeJSString(jibo) + "\")");
  }

  @SimpleFunction(description = "Wrapper for addFive")
  public double AddFive(double lhs, double rhs) {
      return RunJSAndWait_Return_double("window.test.addFive(" + lhs + ", " + rhs + ")");
  }
}