import { UI } from "./app/ui";
import HistoryPage from "./app/views/history";
import Navigation from "./app/navigation";
import SettingsView from "./app/views/settings";
import ShareView from "./app/views/share";
import SpeedView from "./app/speedtest";

/**
 * Speed Test web UI
 *
 * @class WebUI
 */
export default class App {
  /**
   * Create an instance of WebUI
   */
  constructor() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./serviceWorker.js");
    }

    this.navigation = new Navigation();
    this.speedtest = new SpeedView();

    this.historyView = new HistoryPage();
    this.settingsView = new SettingsView();
    this.shareView = new ShareView();

    this.routes = [
      {
        url: "/about",
        handler: this.aboutPageHandler
      },
      {
        url: "/results",
        handler: this.resultsPageHandler
      },
      {
        url: "/run",
        handler: this.runPageHandler
      },
      {
        url: "/settings",
        handler: this.settingsPageHandler
      },
      {
        pattern: /result(\/[0-9a-f-]+)?/,
        handler: this.resultPageHandler
      },
      {
        pattern: /share(\/[0-9a-f-]+)?/,
        handler: this.sharePageHandler
      }
    ];
    this.attachStateHandler();
  }

  /**
   * Attach the handler observing history state
   */
  attachStateHandler() {
    window.addEventListener("popstate", () => {
      this.speedtest.stopTest(true);
      UI.$shareResultButton.setAttribute("hidden", "");
      UI.dismissUnknownResultsAlert();

      const hasRoute = this.routes.some(route => {
        if (route.url && document.location.pathname === route.url) {
          route.handler.apply(this);
          return true;
        }
        if (route.pattern && route.pattern.test(document.location.pathname)) {
          route.handler.apply(this);
          return true;
        }
      });
      if (!hasRoute) this.defaultPageHandler();
    });
    window.dispatchEvent(new Event("popstate"));
  }

  aboutPageHandler() {
    UI.showPage("about");
    document.title = "Speed Test - About";
  }

  resultPageHandler() {
    UI.showPage("speedtest");
    document.title = "Speed Test - Result";
    this.speedtest.loadResults();
  }

  resultsPageHandler() {
    UI.showPage("history");
    document.title = "Speed Test - Results history";
    this.historyView.loadResultsHistory();
  }

  runPageHandler() {
    UI.showPage("speedtest");
    document.title = "Speed Test - Running...";
    this.speedtest.startTest();
  }

  settingsPageHandler() {
    UI.showPage("settings");
    document.title = "Speed Test - Settings";
  }

  sharePageHandler() {
    UI.showPage("share");
    document.title = "Speed Test - Share result";
    this.shareView.generateShareResult();
  }

  defaultPageHandler() {
    UI.showPage("speedtest");
    UI.$speedtest.className = "ready";
    document.title = "Speed Test";
  }
}
