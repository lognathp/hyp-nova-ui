import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-branch-change',
  standalone: true,
  imports: [],
  templateUrl: './branch-change.component.html',
  styleUrl: './branch-change.component.scss'
})
export class BranchChangeComponent {

  @Output() branchChangeAction = new EventEmitter<any>();

  action(arg: string) {
   this.branchChangeAction.emit({ action: arg});
    }
}
