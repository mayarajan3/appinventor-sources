// AUTO-GENERATED FROM blocks.json
// -*- mode: java; c-basic-offset: 2; -*-
package edu.mit.appinventor.ai.conversion;

import java.util.logging.Level;
import java.util.logging.Logger;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
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
@UsesAssets(fileNames = "scratch3prg95grpjibo.html")
public class GeneratedExtension extends AndroidNonvisibleComponent {

    private final Activity activity;
    private final WebView webView;
    private static final Logger LOG = Logger.getLogger(GeneratedExtension.class.getName());
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
        webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webView.setWebContentsDebuggingEnabled(true);
        webView.addJavascriptInterface(new JSBridge(), "AndroidBridge");
        try {
            webView.loadUrl(form.getAssetPathForExtension(GeneratedExtension.this, "scratch3prg95grpjibo.html"));
        } catch (Exception e) {
            LOG.log(Level.SEVERE, "Error loading teachable_machine.html", e);
        }
        // 
        //     webView.loadUrl("http://localhost/scratch3prg95grpjibo.html");
        // } catch (Exception e) {
        //     LOG.log(Level.SEVERE, "Error loading teachable_machine.html", e);
        // }
    }



    @SimpleFunction(description = "Load HTML from assets")
    public void loadHTMLFromAssets(String filename) {
        try {
            String html = "";
            java.io.InputStream is = activity.getAssets().open(filename);
            java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is));
            String line;
            while ((line = reader.readLine()) != null) html += line + "\n";
            reader.close();
            webView.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
        } catch (Exception e) {
            e.printStackTrace();
        }
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
    
  @SimpleFunction(description = "Wrapper for JiboButton")
  public void JiboButton() {
      RunJSAndWait("window.test.JiboButton()");
  }

  @SimpleFunction(description = "Wrapper for SetJiboName")
  public void SetJiboName(String name) {
      RunJSAndWait("window.test.SetJiboName(\" + escapeJSString(name) + \")");
  }

  @SimpleFunction(description = "Wrapper for JiboTTS")
  public void JiboTTS(String text) {
      RunJSAndWait("window.test.JiboTTS(\" + escapeJSString(text) + \")");
  }

  @SimpleFunction(description = "Wrapper for JiboAsk")
  public void JiboAsk(String text) {
      RunJSAndWait("window.test.JiboAsk(\" + escapeJSString(text) + \")");
  }

  @SimpleFunction(description = "Wrapper for JiboListen")
  public void JiboListen() {
      RunJSAndWait("window.test.JiboListen()");
  }

  @SimpleFunction(description = "Wrapper for JiboDance")
  public void JiboDance(String dance) {
      RunJSAndWait("window.test.JiboDance(\" + escapeJSString(dance) + \")");
  }

  @SimpleFunction(description = "Wrapper for JiboAudio")
  public void JiboAudio(String audio) {
      RunJSAndWait("window.test.JiboAudio(\" + escapeJSString(audio) + \")");
  }

  @SimpleFunction(description = "Wrapper for JiboVolume")
  public void JiboVolume(String volume) {
      RunJSAndWait("window.test.JiboVolume(\" + escapeJSString(volume) + \")");
  }

  @SimpleFunction(description = "Wrapper for JiboEmote")
  public void JiboEmote(String anim) {
      RunJSAndWait("window.test.JiboEmote(\" + escapeJSString(anim) + \")");
  }

  @SimpleFunction(description = "Wrapper for JiboIcon")
  public void JiboIcon(String icon) {
      RunJSAndWait("window.test.JiboIcon(\" + escapeJSString(icon) + \")");
  }

  @SimpleFunction(description = "Wrapper for JiboLED")
  public void JiboLED(String color) {
      RunJSAndWait("window.test.JiboLED(\" + escapeJSString(color) + \")");
  }

  @SimpleFunction(description = "Wrapper for JiboLook")
  public void JiboLook(String dir) {
      RunJSAndWait("window.test.JiboLook(\" + escapeJSString(dir) + \")");
  }
}