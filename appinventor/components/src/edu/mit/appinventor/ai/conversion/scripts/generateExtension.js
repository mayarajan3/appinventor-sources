import fs from "fs";
import path from "path";

const blocks = JSON.parse(fs.readFileSync("blocks.json", "utf-8"));

const assetsDir = "src/edu/mit/appinventor/ai/conversion/assets";
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });


const htmlFileName = path.join(assetsDir, "scratch3prg95grpjibo.html");
const jsFileName1 = "ExtensionFramework.js";
const jsFileName2 = "scratch3prg95grpjibo.js";


// const jsFileName1 = "src/edu/mit/appinventor/ai/conversion/assets/simpleprg95grpexample.js";
// const jsFileName2 = "src/edu/mit/appinventor/ai/conversion/assets/ExtensionFramework.js";

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

function escapeNewlines(input) {
    if (input == null) return null;
        return input
            .replace("\n", "\\n");   // escape newline
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
        return '\\""' + ' + ' + p.name + ' + ' + '"\\"';
      }
      return '\\"" + ' + p.name + ' + "\\"';
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

// function chunkString(str, size) {
//   const chunks = [];
//   for (let i = 0; i < str.length; i += size) {
//     chunks.push(str.slice(i, i + size));
//   }
//   return chunks;
// }

const content1 = fs.readFileSync(jsFileName1, "utf-8");
const content2 = fs.readFileSync(jsFileName2, "utf-8");

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Extension WebView</title>
</head>
<body>
<script>${content1}</script>
<script>${content2}</script>
<script>
setTimeout(() => { window.test = new window.scratch3prg95grpjibo.Extension(); }, 2000);
</script>
</body>
</html>
`;

function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks;
  }
  


function generateExtension(blocks) {
  const methods = blocks.map(generateBlockMethod).join("\n");
  const chunks = chunkString(htmlContent, 8000);
const javaChunks = chunks.map(escapeJavaString);
const javaString = javaChunks.map(c => `"${c}"`).join(" + \n");

// Join as concatenated Java string

  return `// AUTO-GENERATED FROM blocks.json
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

import java.util.logging.Level;
import java.util.logging.Logger;
import android.util.Log;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.WebSettings;
import android.webkit.WebChromeClient;
import java.util.concurrent.Semaphore;

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
        webView.setWebChromeClient(new WebChromeClient() {});
        webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_COMPATIBILITY_MODE);
        webView.getSettings().setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        webView.setWebContentsDebuggingEnabled(true);
        webView.addJavascriptInterface(new JSBridge(), "AndroidBridge");
        webView.getSettings().setAllowFileAccess(true);
        try {
            webView.loadUrl(form.getAssetPathForExtension(GeneratedExtension.this, "scratch3prg95grpjibo.html"));
        } catch (Exception e) {
            LOG.log(Level.SEVERE, "Error loading teachable_machine.html", e);
        }
    }

    @SimpleFunction(description = "Load HTML from assets")
    public void loadHTMLFromAssets(String filename) {
        try {
            String html = "";
            java.io.InputStream is = activity.getAssets().open(filename);
            java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.InputStreamReader(is));
            String line;
            while ((line = reader.readLine()) != null) html += line + "\\n";
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
