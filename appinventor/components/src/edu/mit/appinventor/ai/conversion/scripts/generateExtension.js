import fs from "fs";

const blocks = JSON.parse(fs.readFileSync("blocks.json", "utf-8"));

// Map JS return type to Java type and casting snippet
function generateMethodReturnType(block) {
  const { returns, async } = block;

  switch (returns) {
    case "number":
      return {
        javaType: "double",
        cast: `Object result = RunJSAndWait_Return("${block.name}()");
if (result instanceof Number) return ((Number) result).doubleValue();
return 0.0;`
      };
    case "boolean":
      return {
        javaType: "boolean",
        cast: `Object result = RunJSAndWait_Return("${block.name}()");
if (result instanceof Boolean) return (Boolean) result;
return false;`
      };
    case "string":
      return {
        javaType: "String",
        cast: `Object result = RunJSAndWait_Return("${block.name}()");
return result != null ? result.toString() : "";`
      };
    case "object":
      return {
        javaType: "Object",
        cast: `return RunJSAndWait_Return("${block.name}()");`
      };
    default:
      return {
        javaType: "void",
        cast: async ? `RunAsyncJS("${block.name}()");` : `RunJSAndWait("${block.name}()");`
      };
  }
}

function generateBlockMethod(block) {
  const { name } = block;
  const methodName = name.charAt(0).toUpperCase() + name.slice(1);
  const { javaType, cast } = generateMethodReturnType(block);

  if (javaType === "void") {
    return `
  @SimpleFunction(description = "Wrapper for ${name}")
  public void ${methodName}() {
      ${cast}
  }`;
  } else {
    return `
  @SimpleFunction(description = "Wrapper for ${name}")
  public ${javaType} ${methodName}() {
      ${cast}
  }`;
  }
}

function generateExtension(blocks) {
  const methods = blocks.map(generateBlockMethod).join("\n");

  return `// AUTO-GENERATED FROM blocks.json
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
${methods}
}`;
}

fs.writeFileSync("GeneratedExtension.java", generateExtension(blocks), "utf-8");
console.log("✅ GeneratedExtension.java created!");
