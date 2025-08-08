import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ToolsRoutingModule } from './tools-routing.module';
import { ToolsComponent } from './tools.component';
import { AddToolComponent } from './add/add.component';
import { EditToolComponent } from './edit/edit.component';
import { SharedPipesModule } from '../../shareds/shared-pipes.module';

@NgModule({
  declarations: [
    ToolsComponent,
    AddToolComponent,
    EditToolComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ToolsRoutingModule,
    SharedPipesModule
  ]
})
export class ToolsModule { }
