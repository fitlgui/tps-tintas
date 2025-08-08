import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ToolsComponent } from './tools.component';
import { AddToolComponent } from './add/add.component';
import { EditToolComponent } from './edit/edit.component';
import { adminEditGuard } from 'src/app/core/guards/admin-edit.guard';

const routes: Routes = [
  {
    path: '',
    component: ToolsComponent
  },
  {
    path: 'add',
    component: AddToolComponent,
    canActivate: [adminEditGuard]
  },
  {
    path: 'edit/:id',
    component: EditToolComponent,
    canActivate: [adminEditGuard]
  },
  {
    path: 'view/:id',
    component: ToolsComponent // Redireciona para a lista com o item em destaque
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ToolsRoutingModule { }
