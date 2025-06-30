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
    private String jsResult = "";

    public SyncJS(ComponentContainer container) {
        super(container.$form());
        this.activity = container.$context();

        webView = new WebView(activity);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.addJavascriptInterface(new JSBridge(), "AndroidBridge");
    }

    @SimpleFunction(description = "Load HTML into the internal WebView")
    public void LoadHtml(String html) {
        webView.loadDataWithBaseURL(null, html, "text/html", "utf-8", null);
    }

    @SimpleFunction(description = "Call JavaScript and wait for result synchronously")
    public String CallAndWait(final String js) {
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
        public void setResult(String result) {
            jsResult = result;
            semaphore.release();
        }
    }
} 
