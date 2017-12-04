import {ActorQueryOperationTypedMediated, Bindings, IActorQueryOperationOutput,
  IActorQueryOperationTypedMediatedArgs} from "@comunica/bus-query-operation";
import {BindingsStream} from "@comunica/bus-query-operation";
import {IActorTest} from "@comunica/core";
import {Algebra} from "sparqlalgebrajs";

/**
 * A comunica Slice Query Operation Actor.
 */
export class ActorQueryOperationSlice extends ActorQueryOperationTypedMediated<Algebra.Slice> {

  constructor(args: IActorQueryOperationTypedMediatedArgs) {
    super(args, 'slice');
  }

  public async testOperation(pattern: Algebra.Slice, context?: {[id: string]: any}): Promise<IActorTest> {
    return true;
  }

  public async runOperation(pattern: Algebra.Slice, context?: {[id: string]: any})
  : Promise<IActorQueryOperationOutput> {
    // Resolve the input
    const output: IActorQueryOperationOutput = await this.mediatorQueryOperation.mediate(
      { operation: pattern.input, context });

    // Slice the bindings stream
    const bindingsStream: BindingsStream = output.bindingsStream.range(pattern.start,
      pattern.start + pattern.length - 1);

    // If we find metadata, apply slicing on the total number of items
    const metadata: Promise<{[id: string]: any}> = !output.metadata ? null : output.metadata.then((subMetadata) => {
      let totalItems: number = subMetadata.totalItems;
      if (isFinite(totalItems)) {
        totalItems -= pattern.start;
        totalItems = Math.min(totalItems, pattern.length);
      }
      return Object.assign({}, subMetadata, { totalItems });
    });

    return { bindingsStream, metadata, variables: output.variables };
  }

}