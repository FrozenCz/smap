import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'ns-main-page',
  templateUrl: './main-page.component.html',
  styles: ['Button{font-size:50}']
})
export class MainPageComponent implements OnInit {
  constructor(private router: Router) {
  }

  ngOnInit() {
  }


}
