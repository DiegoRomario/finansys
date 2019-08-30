import { EntryService } from './../shared/entry.service';
import { Component, OnInit } from '@angular/core';
import { Entry } from '../shared/entry.model';
import { element } from '@angular/core/src/render3';

@Component({
  selector: 'app-entry-list',
  templateUrl: './entry-list.component.html',
  styleUrls: ['./entry-list.component.css']
})
export class EntryListComponent implements OnInit {

  entries: Entry[] = [];

  constructor(private entryService: EntryService) { }

  ngOnInit() {
    this.entryService.getAll().subscribe(
      entries => this.entries = entries,
      error => alert('Erro ao carregar as entradas')
    );
  }

  deleteEntry(entry: Entry) {
    const mustDelete = confirm('Deseja realmente remover este item?');
    if (mustDelete) {
    this.entryService.delete(entry.id).subscribe(
      // tslint:disable-next-line: no-shadowed-variable
      () => this.entries = this.entries.filter(element => element !== entry),
      () => alert('Erro ao tentar excluir'));
    }
  }
}
