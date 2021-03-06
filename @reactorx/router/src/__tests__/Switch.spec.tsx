import React from "react";
import { Redirect, Route, Router, Switch } from "..";
import { mount } from "@reactorx/testutils";
import { createMemoryHistory } from "history";

describe("A <Switch>", () => {
  it("does not render a second <Route> that also matches the URL", async () => {
    const node = await mount(
      <Router history={createMemoryHistory({ initialEntries: ["/one"] })}>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Route path="/one" render={() => <h1>two</h1>} />
        </Switch>
      </Router>,
    );

    expect(node.innerHTML).not.toContain("two");
  });

  it("renders the first <Redirect> that matches the URL", async () => {
    const node = await mount(
      <Router history={createMemoryHistory({ initialEntries: ["/three"] })}>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Route path="/two" render={() => <h1>two</h1>} />
          <Redirect from="/three" to="/two" />
        </Switch>
      </Router>,
    );

    expect(node.innerHTML).toContain("two");
  });

  it("does not render a second <Redirect> that also matches the URL", async () => {
    const node = await mount(
      <Router history={createMemoryHistory({ initialEntries: ["/three"] })}>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Route path="/two" render={() => <h1>two</h1>} />
          <Redirect from="/three" to="/two" />
          <Redirect from="/three" to="/one" />
        </Switch>
      </Router>,
    );

    expect(node.innerHTML).toContain("two");
  });

  it("renders a Route with no `path` prop", async () => {
    const node = await mount(
      <Router history={createMemoryHistory({ initialEntries: ["/two"] })}>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Route render={() => <h1>two</h1>} />
        </Switch>
      </Router>,
    );

    expect(node.innerHTML).toContain("two");
  });

  it("renders a Redirect with no `from` prop", async () => {
    const node = await mount(
      <Router history={createMemoryHistory({ initialEntries: ["/three"] })}>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Redirect to="/one" />
          <Route path="/two" render={() => <h1>two</h1>} />
        </Switch>
      </Router>,
    );

    expect(node.innerHTML).toContain("one");
  });

  it("handles subsequent redirects", async () => {
    const node = await mount(
      <Router history={createMemoryHistory({ initialEntries: ["/one"] })}>
        <Switch>
          <Redirect from="/one" to="/two" />
          <Redirect from="/two" to="/three" />
          <Route path="/three" render={() => <h1>three</h1>} />
        </Switch>
      </Router>,
    );

    expect(node.innerHTML).toContain("three");
  });

  it("handles comments", async () => {
    const node = await mount(
      <Router history={createMemoryHistory({ initialEntries: ["/cupcakes"] })}>
        <Switch>
          <Route path="/bubblegum" render={() => <div>bub</div>} />
          {/* this is a comment */}
          <Route path="/cupcakes" render={() => <div>cup</div>} />
        </Switch>
      </Router>,
    );

    expect(node.innerHTML).not.toContain("bub");
    expect(node.innerHTML).toContain("cup");
  });

  it("renders with non-element children", async () => {
    const node = await mount(
      <Router history={createMemoryHistory({ initialEntries: ["/one"] })}>
        <Switch>
          <Route path="/one" render={() => <h1>one</h1>} />
          {false}
          {undefined}
        </Switch>
      </Router>,
    );

    expect(node.innerHTML).toMatch(/one/);
  });

  it("can use a `location` prop instead of `router.location`", async () => {
    const node = await mount(
      <Router history={createMemoryHistory({ initialEntries: ["/one"] })}>
        <Switch location={{ pathname: "/two" }}>
          <Route path="/one" render={() => <h1>one</h1>} />
          <Route path="/two" render={() => <h1>two</h1>} />
        </Switch>
      </Router>,
    );

    expect(node.innerHTML).toMatch(/two/);
  });
});
