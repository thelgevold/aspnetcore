import * as msgpack5 from "msgpack5";

import { BinaryMessageFormat } from "./BinaryMessageFormat";

export class MessagepackSerializer {

  private userEncoder: msgpack5.Encoder;
  private wrapperEncoder: msgpack5.Encoder;

  private userDataPayload: any;
  private wrapperDataPayload: any;

  constructor(messagePackOptions: any) {
    this.userEncoder = msgpack5(messagePackOptions).encoder();
    this.wrapperEncoder = msgpack5().encoder();
  }

  public writeUserData(msg: any[]) {
    this.userEncoder.on("data", (data: any) => {
      this.userDataPayload = new Uint8Array(data.length);
      this.userDataPayload.set(data);
    });

    this.userEncoder.write(msg);

    this.userEncoder.end();
    this.userEncoder.removeAllListeners("data");
  }

  public writeWrapper(msg: any[]) {
    this.wrapperEncoder.on("data", (data: any) => {
      this.wrapperDataPayload = new Uint8Array(data.length);
      this.wrapperDataPayload.set(data);
    });

    this.wrapperEncoder.write(msg);

    this.wrapperEncoder.end();
    this.wrapperEncoder.removeAllListeners("data");
  }

  public serialize(): ArrayBuffer {
    const wrapperData = BinaryMessageFormat.write(this.wrapperDataPayload.slice());
    const userData = BinaryMessageFormat.write(this.userDataPayload.slice());

    const merged = new Uint8Array(wrapperData.byteLength + userData.byteLength);
    merged.set(new Uint8Array(wrapperData), 0);
    merged.set(new Uint8Array(userData), wrapperData.byteLength);

    return merged.buffer;
  }
}
