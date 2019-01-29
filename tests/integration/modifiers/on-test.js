import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render, click, settled } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';
import { set } from '@ember/object';
import { run } from '@ember/runloop';

module('Integration | Modifier | on', function(hooks) {
  setupRenderingTest(hooks);

  test('it basically works', async function(assert) {
    assert.expect(3);

    this.someMethod = event => {
      assert.ok(
        event instanceof MouseEvent,
        'first argument is a `ClickEvent`'
      );
      assert.strictEqual(
        event.target.tagName,
        'BUTTON',
        'correct element tagName'
      );
      assert.dom(event.target).hasAttribute('data-foo', 'some-thing');
    };

    await render(
      hbs`<button data-foo="some-thing" {{on 'click' this.someMethod}}></button>`
    );

    await click('button');
  });

  test('it can accept event options', async function(assert) {
    assert.expect(1);

    let n = 0;
    this.someMethod = () => n++;

    await render(
      hbs`<button {{on 'click' this.someMethod once=true}}></button>`
    );

    await click('button');
    await click('button');

    assert.strictEqual(n, 1, 'callback has only been called once');
  });

  test('it is re-registered, when the callback changes', async function(assert) {
    assert.expect(2);

    let a = 0;
    this.someMethod = () => a++;

    await render(hbs`<button {{on 'click' this.someMethod}}></button>`);

    await click('button');

    let b = 0;
    run(() => set(this, 'someMethod', () => b++));
    await settled();

    await click('button');

    assert.strictEqual(a, 1);
    assert.strictEqual(b, 1);
  });

  test('it does not error when a callback was not registered', async function(assert) {
    assert.expect(0);

    await render(hbs`<button data-foo="some-thing" {{on 'click'}}></button>`);

    await click('button');
  });

  test('when callback is initially missing but subsequently set it works', async function(assert) {
    assert.expect(3);

    this.someMethod = event => {
      assert.ok(
        event instanceof MouseEvent,
        'first argument is a `ClickEvent`'
      );
      assert.strictEqual(
        event.target.tagName,
        'BUTTON',
        'correct element tagName'
      );
      assert.dom(event.target).hasAttribute('data-foo', 'some-thing');
    };

    this.shouldListen = false;
    await render(
      hbs`<button data-foo="some-thing" {{on 'click' (if this.shouldListen this.someMethod)}}></button>`
    );

    await click('button'); // does not trigger someMethod

    this.set('shouldListen', true);

    await click('button'); // does trigger someMethod
  });
});
