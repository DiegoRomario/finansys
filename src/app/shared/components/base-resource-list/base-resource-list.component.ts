import { OnInit } from '@angular/core';
import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

export abstract class BaseResourceListComponent<T extends BaseResourceModel> implements OnInit {

  resources: T[] = [];

  constructor(private resourceService: BaseResourceService<T>) { }

  ngOnInit() {
    this.resourceService.getAll().subscribe(
        resources => this.resources = resources,
      error => alert('Erro ao carregar as entradas')
    );
  }

  deleteResource(resource: T) {
    const mustDelete = confirm('Deseja realmente remover este item?');
    if (mustDelete) {
    this.resourceService.delete(resource.id).subscribe(
      // tslint:disable-next-line: no-shadowed-variable
      () => this.resources = this.resources.filter(element => element !== resource),
      () => alert('Erro ao tentar excluir'));
    }
  }
}
