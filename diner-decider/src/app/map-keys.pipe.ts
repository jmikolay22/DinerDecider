import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'mapKeys'})
export class MapKeysPipe implements PipeTransform {
  transform(value: any, args?: any[]): Object[] {
      let returnArray = [];

      value.forEach((entryVal, entryKey) => {
          returnArray.push({
              key: entryKey,
              val: entryVal
          });
      });
      console.log(returnArray);
      return returnArray;
  }
}