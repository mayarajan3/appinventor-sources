// AUTO-GENERATED FROM blocks.json
// -*- mode: java; c-basic-offset: 2; -*-
package edu.mit.appinventor.ai.generated;

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
    private Object jsResult;
    private String currentFunction = "";

    public GeneratedExtension(ComponentContainer container) {
        super(container.$form());
        this.activity = container.$context();

        webView = new WebView(activity);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new JSBridge(), "AndroidBridge");
    }

    @SimpleFunction(description = "Load HTML into the internal WebView")
    public void LoadHTML(String html) {
        webView.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
    }

    @SimpleFunction(description = "Call JavaScript and wait for result synchronously")
    public Object RunJSAndWait_Return(final String js) {
        jsResult = null;
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(js, null);
            }
        });
        try { semaphore.acquire(); } catch (InterruptedException e) { return null; }
        return jsResult;
    }

    @SimpleFunction(description = "Run JavaScript asynchronously without waiting for result")
    public void RunAsyncJS(final String js) {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(js, null);
            }
        });
    }

    @SimpleFunction(description = "Run JavaScript and wait for it to finish (no return value)")
    public void RunJSAndWait(final String js) {
        jsResult = null;
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(js, null);
            }
        });
        try { semaphore.acquire(); } catch (InterruptedException e) {}
    }

    private class JSBridge {
        @JavascriptInterface
        public void setResult(String fnName, Object value, String type) {
            switch (type) {
                case "string":
                    jsResult = value != null ? value.toString() : "";
                    break;
                case "number":
                    if (value instanceof Double) jsResult = (Double) value;
                    else if (value instanceof Number) jsResult = ((Number) value).doubleValue();
                    else if (value != null) {
                        try { jsResult = Double.parseDouble(value.toString()); }
                        catch (NumberFormatException e) { jsResult = 0.0; }
                    } else jsResult = 0.0;
                    break;
                case "boolean":
                    if (value instanceof Boolean) jsResult = (Boolean) value;
                    else if (value != null) jsResult = Boolean.parseBoolean(value.toString());
                    else jsResult = false;
                    break;
                case "object":
                    jsResult = value;
                    break;
                case "undefined":
                    jsResult = null;
                    break;
            }
            semaphore.release();
        }
    }

    // AUTO-GENERATED METHODS FROM blocks.json

  @SimpleFunction(description = "Wrapper for log")
  public void Log() {
      RunJSAndWait("log()");
  }

  @SimpleFunction(description = "Wrapper for indicateMessage")
  public void IndicateMessage() {
      RunAsyncJS("indicateMessage()");
  }

  @SimpleFunction(description = "Wrapper for dummyUI")
  public void DummyUI() {
      RunJSAndWait("dummyUI()");
  }

  @SimpleFunction(description = "Wrapper for counterUI")
  public void CounterUI() {
      RunJSAndWait("counterUI()");
  }

  @SimpleFunction(description = "Wrapper for colorUI")
  public void ColorUI() {
      RunJSAndWait("colorUI()");
  }

  @SimpleFunction(description = "Wrapper for imageBlock")
  public void ImageBlock() {
      RunJSAndWait("imageBlock()");
  }

  @SimpleFunction(description = "Wrapper for addFive")
  public double AddFive() {
      Object result = RunJSAndWait_Return("addFive()");
if (result instanceof Number) return ((Number) result).doubleValue();
return 0.0;
  }
}