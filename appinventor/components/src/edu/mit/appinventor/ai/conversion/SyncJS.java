// -*- mode: java; c-basic-offset: 2; -*-
// Copyright 2018 MIT, All rights reserved
// Released under the Apache License, Version 2.0
// http://www.apache.org/licenses/LICENSE-2.0

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
        version = 3,
        description = "Synchronous and Asynchronous JS WebView Extension",
        category = ComponentCategory.EXTENSION,
        nonVisible = true,
        iconName = "")
@SimpleObject(external = true)
public class SyncJS extends AndroidNonvisibleComponent {

    private final Activity activity;
    private final WebView webView;
    private final Semaphore semaphore = new Semaphore(0);
    private Object jsResult;
    private String currentFunction = "";

    public SyncJS(ComponentContainer container) {
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
        jsResult = "";

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(js, null);
            }
        });

        try {
            semaphore.acquire();
        } catch (InterruptedException e) {
            return "error";
        }

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

// This block pauses execution until JavaScript calls: AndroidBridge.setResult("done")
    @SimpleFunction(description = "Run JavaScript and wait for it to finish (no return value)")
    public void RunJSAndWait(final String js) {
        jsResult = "";

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                webView.evaluateJavascript(js, null);
            }
        });

        try {
            semaphore.acquire();
        } catch (InterruptedException e) {
            // swallow exception
        }
    }

    private class JSBridge {
        @JavascriptInterface
        public void setResult(String fnName, Object value, String type) {
             switch (type) {
                case "string":
                    String strValue = (String) value;
                    jsResult = strValue;
                    break;
                case "number":
                    // JS numbers are passed as Double
                    Double numValue = value instanceof Double ? (Double) value : null;
                    jsResult = numValue;
                    break;
                case "boolean":
                    Boolean boolValue = value instanceof Boolean ? (Boolean) value : null;
                    jsResult = boolValue;
                    break;
                case "object":
                    // JS objects come as JSON strings
                    String jsonValue = value.toString();
                    jsResult = jsonValue;
                    break;
                case "undefined":
                    jsResult = null;
                    break;
            }
            semaphore.release();
        }
    }
} 
