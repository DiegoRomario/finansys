import { BaseResourceService } from 'src/app/shared/services/base-resource.service';
import { Component, OnInit, AfterContentChecked, Injector } from '@angular/core';
import toastr from 'toastr';

import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { BaseResourceModel } from '../../models/base-resource.model';

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {


    currentAction: string;
    resourceForm: FormGroup;
    pageTitle: string;
    serverErrorMessages: string[] = null;
    submittingForm: boolean = false;

    protected route: ActivatedRoute;
    protected router: Router;
    protected formBuilder: FormBuilder;

    constructor(protected injector: Injector,
                public resource: T,
                protected resourceService: BaseResourceService<T>,
                protected jsonDataToResourceFn: (jsonData: any) => T

    ) {
        this.route = this.injector.get(ActivatedRoute);
        this.router = this.injector.get(Router);
        this.formBuilder = this.injector.get(FormBuilder);
    }

    ngOnInit() {
        this.setCurrentAction();
        this.buildResourceForm();
        this.loadResource();
    }

    ngAfterContentChecked(): void {
        this.setPageTitle();
    }



    submitForm() {
        this.submittingForm = true;
        if (this.currentAction === 'new') {
            this.createResource();
        } else {
            this.updateResource();
        }
    }

    protected updateResource() {
        const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
        this.resourceService.update(resource)
            .subscribe(
                // tslint:disable-next-line: no-shadowed-variable
                resource => this.actionsForSuccess(resource),
                error => this.actionsForError(error)
            );
    }


    protected createResource() {
        const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
        this.resourceService.create(resource)
            .subscribe(
                // tslint:disable-next-line: no-shadowed-variable
                resource => this.actionsForSuccess(resource),
                error => this.actionsForError(error)
            );
    }

    protected actionsForSuccess(resource: T) {
        toastr.success('Solicitação processada com sucesso!');

        const baseComponentPath: string = this.route.snapshot.parent.url[0].path;

        this.router.navigateByUrl(baseComponentPath, { skipLocationChange: true }).then(
            () => this.router.navigate([baseComponentPath, resource.id, 'edit'])
        );
    }

    private actionsForError(error) {
        toastr.error('Ocorreu um erro ao processar a sua solicitação!');
        this.submittingForm = false;
        if (error.status === 422) {
            this.serverErrorMessages = JSON.parse(error._body).errors;
        } else {
            this.serverErrorMessages = ['Falha na comunicação com o server'];
        }
    }

    private setCurrentAction() {
        if (this.route.snapshot.url[0].path === 'new') {
            this.currentAction = 'new';
        } else {
            this.currentAction = 'edit';
        }
    }



    private loadResource() {
        if (this.currentAction === 'edit') {
            this.route.paramMap.pipe(
                switchMap(params => this.resourceService.getById(+params.get('id')))
            )
                .subscribe(
                    (resource) => {
                        this.resource = resource;
                        this.resourceForm.patchValue(resource);
                    },
                    (error) => alert('Ocorreu um erro no servidor, tente mais tarde!')
                );
        }
    }

    protected setPageTitle() {
        if (this.currentAction === 'new') {
            this.pageTitle = this.creationPageTitle();
        } else {
            this.pageTitle = this.editionPageTitle();
        }
    }

    protected creationPageTitle(): string {
        return 'Novo';
    }
    protected editionPageTitle(): string {
        return 'Edição';
    }

    protected abstract buildResourceForm(): void;

}
