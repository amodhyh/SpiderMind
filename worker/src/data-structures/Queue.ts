
class Node<T>{
    value : T
    prev :Node<T> | null = null
    next :Node<T> | null = null

    constructor(value:T){
        this.value=value

    }

}

export class Queue<T>{

    private head: Node<T> | null = null;
    private tail: Node<T> | null = null;
    private _size = 0;


    enqueue(item: T): void {
    const newNode = new Node(item);
    if (!this.tail) {
      this.head = this.tail = newNode;
    } else {
      this.tail.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this._size++;
  }

  /**
   * Removes from the front: O(1)
   */
  dequeue(): T | undefined {
    if (!this.head) return undefined;

    const removedValue = this.head.value;
    this.head = this.head.next;

    if (this.head) {
      this.head.prev = null;
    } else {
      this.tail = null; // Queue is now empty
    }

    this._size--;
    return removedValue;
  }

  
  
  peek(): T | undefined {
    return this.head?.value;
  }

  
  
    get size(): number {
    return this._size;
    }

    

    get isEmpty(): boolean {
    return this._size === 0;
    }


}