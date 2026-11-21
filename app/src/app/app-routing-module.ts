import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
 import { Goals } from './goals/goals';
const routes: Routes = [
   { path: 'goals', component: Goals },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
