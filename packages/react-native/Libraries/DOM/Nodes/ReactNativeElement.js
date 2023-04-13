/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 * @flow strict-local
 */

// flowlint unsafe-getters-setters:off

import type {
  HostComponent,
  INativeMethods,
  InternalInstanceHandle,
  MeasureInWindowOnSuccessCallback,
  MeasureLayoutOnSuccessCallback,
  MeasureOnSuccessCallback,
  ViewConfig,
} from '../../Renderer/shims/ReactNativeTypes';
import type {ElementRef} from 'react';

import TextInputState from '../../Components/TextInput/TextInputState';
import {getFabricUIManager} from '../../ReactNative/FabricUIManager';
import {create as createAttributePayload} from '../../ReactNative/ReactFabricPublicInstance/ReactNativeAttributePayload';
import warnForStyleProps from '../../ReactNative/ReactFabricPublicInstance/warnForStyleProps';
import ReadOnlyElement from './ReadOnlyElement';
import ReadOnlyNode from './ReadOnlyNode';
import {getShadowNode} from './ReadOnlyNode';
import nullthrows from 'nullthrows';

const noop = () => {};

export default class ReactNativeElement
  extends ReadOnlyElement
  implements INativeMethods
{
  // These need to be accessible from `ReactFabricPublicInstanceUtils`.
  __nativeTag: number;
  __internalInstanceHandle: InternalInstanceHandle;

  _viewConfig: ViewConfig;

  constructor(
    tag: number,
    viewConfig: ViewConfig,
    internalInstanceHandle: InternalInstanceHandle,
  ) {
    super(internalInstanceHandle);

    this.__nativeTag = tag;
    this.__internalInstanceHandle = internalInstanceHandle;
    this._viewConfig = viewConfig;
  }

  get offsetHeight(): number {
    return Math.round(this.getBoundingClientRect().height);
  }

  get offsetLeft(): number {
    throw new TypeError('Unimplemented');
  }

  get offsetParent(): ReadOnlyElement | null {
    throw new TypeError('Unimplemented');
  }

  get offsetTop(): number {
    throw new TypeError('Unimplemented');
  }

  get offsetWidth(): number {
    return Math.round(this.getBoundingClientRect().width);
  }

  /**
   * React Native compatibility methods
   */

  blur(): void {
    // $FlowFixMe[incompatible-exact] Migrate all usages of `NativeMethods` to an interface to fix this.
    TextInputState.blurTextInput(this);
  }

  focus() {
    // $FlowFixMe[incompatible-exact] Migrate all usages of `NativeMethods` to an interface to fix this.
    TextInputState.focusTextInput(this);
  }

  measure(callback: MeasureOnSuccessCallback) {
    const node = getShadowNode(this);
    if (node != null) {
      nullthrows(getFabricUIManager()).measure(node, callback);
    }
  }

  measureInWindow(callback: MeasureInWindowOnSuccessCallback) {
    const node = getShadowNode(this);
    if (node != null) {
      nullthrows(getFabricUIManager()).measureInWindow(node, callback);
    }
  }

  measureLayout(
    relativeToNativeNode: number | ElementRef<HostComponent<mixed>>,
    onSuccess: MeasureLayoutOnSuccessCallback,
    onFail?: () => void /* currently unused */,
  ) {
    if (!(relativeToNativeNode instanceof ReadOnlyNode)) {
      if (__DEV__) {
        console.error(
          'Warning: ref.measureLayout must be called with a ref to a native component.',
        );
      }

      return;
    }

    const toStateNode = getShadowNode(this);
    const fromStateNode = getShadowNode(relativeToNativeNode);

    if (toStateNode != null && fromStateNode != null) {
      nullthrows(getFabricUIManager()).measureLayout(
        toStateNode,
        fromStateNode,
        onFail != null ? onFail : noop,
        onSuccess != null ? onSuccess : noop,
      );
    }
  }

  setNativeProps(nativeProps: {...}): void {
    if (__DEV__) {
      warnForStyleProps(nativeProps, this._viewConfig.validAttributes);
    }

    const updatePayload = createAttributePayload(
      nativeProps,
      this._viewConfig.validAttributes,
    );

    const node = getShadowNode(this);

    if (node != null && updatePayload != null) {
      nullthrows(getFabricUIManager()).setNativeProps(node, updatePayload);
    }
  }
}