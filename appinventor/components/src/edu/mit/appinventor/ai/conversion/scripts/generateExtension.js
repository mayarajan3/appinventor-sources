import fs from "fs";


const blocks = JSON.parse(fs.readFileSync("blocks.json", "utf-8"));

const bundleContent = fs.readFileSync("simpleprg95grpexample.js", "utf-8");

const jsFileName = "src/edu/mit/appinventor/ai/conversion/assets/simpleprg95grpexample.js";

// Map JSON type to Java type
function javaType(type) {
  switch (type) {
    case "number": return "double";
    case "string": return "String";
    case "boolean": return "boolean";
    case "undefined": return "void"; // legacy
    case "void": return "void";      // NEW: handle proper void
    default: return "Object"; // use Object for unknown types
  }
}

// Wrap the JS in HTML
const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Extension WebView</title>
</head>
<body>
  <script src="${jsFileName}">
  </script>
</body>
</html>
`;


// Generate method parameters for Java
function generateParams(parameters = []) {
  return parameters.map(p => `${javaType(p.type)} ${p.name}`).join(", ");
}

// Escape string for JS inside Java
function escapeJSString(s) {
  if (s === undefined || s === null) return '';
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

// Generate JS call with parameters
function generateJSCall(block) {
    const prefix = "window.test."; // ensure all calls go through the instance
    if (!block.parameters || block.parameters.length === 0) {
      return `${prefix}${block.name}()`;
    }
  
    const args = block.parameters.map(p => {
      if (p.type === 'string') {
        return '" + escapeJSString(' + p.name + ') + "';
      }
      return '" + ' + p.name + ' + "';
    }).join(", ");
  
    return `${prefix}${block.name}(${args})`;
  }

  // Escape for Java string
function escapeJavaString(str) {
    return str
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\r?\n/g, "\\n");
  }

// Generate a single block method
function generateBlockMethod(block) {
  const { name, returns, async, parameters } = block;
  const retType = javaType(returns);
  const methodName = name.charAt(0).toUpperCase() + name.slice(1);
  const paramList = generateParams(parameters);

  const jsCall = generateJSCall(block);



  let body;
  if (async) {
    if (retType === "void") body = `RunAsyncJS("${jsCall}");`;
    else body = `return (${retType}) RunJSAndWait_Return("${jsCall}");`;
  } else {
    if (retType === "void") body = `RunJSAndWait("${jsCall}");`;
    else body = `return (${retType}) RunJSAndWait_Return("${jsCall}");`;
  }

  return `
  @SimpleFunction(description = "Wrapper for ${name}")
  public ${retType} ${methodName}(${paramList}) {
      ${body}
  }`;
}

const ESCAPE_METHOD = [
  "  // Helper to escape strings for JS",
  "  private static String escapeJSString(String s) {",
  "    if (s == null) return \"\";",
  "    return s.replace(\"\\\\\", \"\\\\\\\\\").replace(\"\\\"\", \"\\\\\\\"\");",
  "  }",
  ""
].join("\n");

function chunkString(str, size) {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
      chunks.push(str.slice(i, i + size));
    }
    return chunks;
  }
  
  

// Generate the full extension
function generateExtension(blocks) {
  const methods = blocks.map(generateBlockMethod).join("\n");

  const escapedHTML = escapeJavaString(htmlContent);

  const chunks = chunkString(htmlContent, 30000); // 30k chars per string
    const escapedChunks = chunks.map(escapeJavaString);
    const concatenated = escapedChunks.map(c => `"${c}"`).join(" + ");

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
        LoadHTML(${concatenated});
        RunJSAndWait("window.test = new window.simpleprg95grpexample.Extension()");
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

${ESCAPE_METHOD}

    private class JSBridge {
        @JavascriptInterface
        public void setResult(String fnName, Object value, String type) {
            switch (type) {
                case "string": jsResult = value != null ? value.toString() : ""; break;
                case "number":
                    if (value instanceof Double) jsResult = (Double) value;
                    else if (value instanceof Number) jsResult = ((Number) value).doubleValue();
                    else if (value != null) {
                        try { jsResult = Double.parseDouble(value.toString()); } catch (NumberFormatException e) { jsResult = 0.0; }
                    } else { jsResult = 0.0; }
                    break;
                case "boolean":
                    if (value instanceof Boolean) jsResult = (Boolean) value;
                    else jsResult = value != null && Boolean.parseBoolean(value.toString());
                    break;
                case "object": jsResult = value; break;
                case "undefined": jsResult = null; break;
            }
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
