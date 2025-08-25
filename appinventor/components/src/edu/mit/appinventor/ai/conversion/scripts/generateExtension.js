import fs from "fs";

const blocks = JSON.parse(fs.readFileSync("blocks.json", "utf-8"));

const jsFileName1 = "src/edu/mit/appinventor/ai/conversion/assets/simpleprg95grpexample.js";
const jsFileName2 = "src/edu/mit/appinventor/ai/conversion/assets/ExtensionFramework.js";

// Map JSON type to Java type
function javaType(type) {
  switch (type) {
    case "number": return "double";
    case "string": return "String";
    case "boolean": return "boolean";
    case "undefined": return "void";
    case "void": return "void";
    default: return "Object";
  }
}

// Escape string for JS inside Java
function escapeJSString(s) {
  if (s === undefined || s === null) return '';
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Generate method parameters for Java
function generateParams(parameters = []) {
  return parameters.map(p => `${javaType(p.type)} ${p.name}`).join(", ");
}

// Generate JS call
function generateJSCall(block) {
    const prefix = "window.test.";
    if (!block.parameters || block.parameters.length === 0) return `${prefix}${block.name}()`;
  
    const args = block.parameters.map(p => {
      if (p.type === "string") {
        // Wrap in quotes so JS gets it as a string literal
        return '\\"' + '" + escapeJSString(' + p.name + ') + "' + '\\"';
      }
      return '" + ' + p.name + ' + "';
    }).join(", ");
  
    return `${prefix}${block.name}(${args})`;
  }

// Generate a single block method with proper double/string handling
function generateBlockMethod(block) {
  const { name, returns, async, parameters } = block;
  const retType = javaType(returns);
  const methodName = name.charAt(0).toUpperCase() + name.slice(1);
  const paramList = generateParams(parameters);
  const jsCall = generateJSCall(block);

  let body = "";
  if (async) {
    if (retType === "void") body = `RunAsyncJS("${jsCall}");`;
    else if (retType === "double") body = `return RunJSAndWait_Return_double("${jsCall}");`;
    else if (retType === "String") body = `return RunJSAndWait_Return_string("${jsCall}");`;
    else body = `return RunJSAndWait_Return("${jsCall}");`;
  } else {
    if (retType === "void") body = `RunJSAndWait("${jsCall}");`;
    else if (retType === "double") body = `return RunJSAndWait_Return_double("${jsCall}");`;
    else if (retType === "String") body = `return RunJSAndWait_Return_string("${jsCall}");`;
    else body = `return RunJSAndWait_Return("${jsCall}");`;
  }

  return `
  @SimpleFunction(description = "Wrapper for ${name}")
  public ${retType} ${methodName}(${paramList}) {
      ${body}
  }`;
}

// Escape HTML for Java string
function escapeJavaString(str) {
  return str.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\n");
}

function chunkString(str, size) {
  const chunks = [];
  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }
  return chunks;
}

// Wrap JS in HTML
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Extension WebView</title>
</head>
<body>
  <script src="${jsFileName2}"></script>
  <script src="${jsFileName1}"></script>
  <script>
    setTimeout(() => { window.test = new window.simpleprg95grpexample.Extension(); }, 2000);
  </script>
</body>
</html>
`;

function generateExtension(blocks) {
  const methods = blocks.map(generateBlockMethod).join("\n");
  const chunks = chunkString(htmlContent, 30000);
  const concatenated = chunks.map(escapeJavaString).map(c => `"${c}"`).join(" + ");

  return `// AUTO-GENERATED FROM blocks.json
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
        LoadHTML(${concatenated});
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
        return s.replace("\\\\", "\\\\\\\\").replace("\\\"", "\\\\\\\"");
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
    ${methods}
}`;
}

const javaFile = generateExtension(blocks);
fs.writeFileSync("../GeneratedExtension.java", javaFile, "utf-8");
console.log("✅ GeneratedExtension.java created!");
