/**
 * BSD 3-Clause License
 *
 * Copyright © 2024, Daniel Jonathan <daniel at cosmicmind dot com>
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice,
 *    this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES LOSS OF USE, DATA, OR PROFITS OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

/**
 * @module Stack
 */

import {
    Optional,
    guard,
} from '@cosmicmind/foundationjs'

import {
    SentinelNode,
} from '@/utils'

/**
 * The `Stackable` interface defines a structure that moves
 * from a child node to its parent node within a `Stack`
 * data structure.
 */
export type Stackable = {
  parent?: Stackable
}

export const StackCompareFn = <T extends Stackable>(a: T, b: T): number => a === b ? 0 : -1

/**
 * Creates a `Stackable` instance of type `T` by using the
 * given node definition.
 */
export const stackNodeCreate = <T extends Stackable>(props?: Omit<T, keyof Stackable>): T => ({
    ...(props ?? {}) as T,
    parent: SentinelNode,
})

/**
 * The `Stack` class represents a linear data structure that
 * stores a single reference to a `Stackable` node called
 * `top`. It creates a `vertical` relationship between the
 * nodes that exist within its structure.
 */
export type Stack<T extends Stackable> = {
  top?: T
  count: number
}

/**
 * Creates a new `Stack` instance.
 */
export const stackCreate = <T extends Stackable>(): Stack<T> => ({
    top: SentinelNode,
    count: 0,
})

/**
 * The `stackPeek` operation looks at the `top` positioned
 * node within the given stack.
 *
 * @performance O(1)
 */
export function stackPeek<T extends Stackable>(stack: Stack<T>): Optional<T> {
    return stack.top
}

/**
 * The `stackPush` operation adds a given node to the `top`
 * position of the given stack.
 *
 * @performance O(1)
 */
export function stackPush<T extends Stackable>(stack: Stack<T>, node: T): void {
    node.parent = stack.top
    stack.top = node
    ++stack.count
}

/**
 * The `stackPop` operation removes the `top` positioned
 * node from the given stack and returns its reference.
 *
 * @performance O(1)
 */
export function stackPop<T extends Stackable>(stack: Stack<T>): Optional<T> {
    const n = stack.top
    if (guard<T>(n)) {
        stack.top = n.parent as T
        n.parent = SentinelNode
        --stack.count
    }
    return n
}

/**
 * The `stackIterator` operation iterates from the `top` positioned
 * iteratively to the final node within the given stack.
 *
 * @performance O(n)
 */
export function *stackIterator<T extends Stackable>(stack: Stack<T>): IterableIterator<T> {
    let n = stack.top
    while (guard<T>(n)) {
        yield n
        n = n.parent as T
    }
}

/**
 * @performance O(n)
 */
export function *stackIterateFrom<T extends Stackable>(node: T): IterableIterator<T> {
    let n = node
    while (guard<T>(n)) {
        yield n
        n = n.parent as T
    }
}

/**
 * @performance O(n)
 */
export function *stackIterateToParent<T extends Stackable>(node: T): IterableIterator<T> {
    let n = node.parent
    while (guard<T>(n)) {
        yield n
        n = n.parent
    }
}

/**
 * The `stackClear` operation clears the given stack by removing
 * all the relationships between its nodes.
 *
 * @performance O(n)
 */
export function stackClear<T extends Stackable>(stack: Stack<T>): void {
    while (guard<T>(stack.top)) {
        stackPop(stack)
    }
}

/**
 * @performance O(n)
 */
export function stackDepth<T extends Stackable>(node: T): number {
    let n = node.parent
    let depth = 0
    while (guard<T>(n)) {
        ++depth
        n = n.parent
    }
    return depth
}

/**
 * The `stackIsTop` assertion looks at the `top` positioned
 * node for the given stack, and determines if the given node
 * is equal to that `top` positioned node.
 *
 * @performance O(1)
 */
export function stackIsTop<T extends Stackable>(stack: Stack<T>, node: T, compare = StackCompareFn<T>): boolean {
    return guard<T>(stack.top) &&  0 === compare(stack.top, node)
}

/**
 * @performance O(n)
 */
export function stackHas<T extends Stackable>(stack: Stack<T>, node: T, compare = StackCompareFn<T>): boolean {
    for (const n of stackIterator(stack)) {
        if (0 === compare(n, node)) {
            return true
        }
    }
    return false
}

/**
 * @performance O(n)
 */
export function stackQuery<T extends Stackable>(stack: Stack<T>, ...fn: ((node: T) => boolean)[]): Set<T> {
    const r = new Set<T>()
    loop: for (const n of stackIterator(stack)) {
        for (const f of fn) {
            if (f(n)) {
                continue
            }
            continue loop
        }
        r.add(n)
    }
    return r
}