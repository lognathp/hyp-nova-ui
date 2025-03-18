import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-variation-addon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './variation-addon.component.html',
  styleUrl: './variation-addon.component.scss'
})
export class VariationAddonComponent  implements OnInit {

  @Input() menuItem: string = '';
  @Input() variations: any = {};
  @Input() addOnChoice: any = {};
  @Output() addedItem = new EventEmitter<any>();
  variation: any = '';
  selectedVarient: number = 0;
  tvariations: any = {};
  taddOnChoice: any = {};
  totalPrice: number = 0;
  quantity:number = 1;

  variationForm!: FormGroup;
  addonForm!: FormGroup;


  constructor(private formBuilder: FormBuilder) {
    this.variationForm = this.formBuilder.group({
      addOngrp: this.formBuilder.array([])
    });
    this.addonForm = this.formBuilder.group({
      addOngrp: this.formBuilder.array([])
    });
  }


  public ngOnInit(): void {

    console.log(this.variations, this.addOnChoice);

    this.tvariations = this.variations.flat().sort((a:any, b:any) => a.price - b.price);
    // this.tvariations = this.variations.flatMap((ele: any) => ele.concat());
    this.taddOnChoice = this.addOnChoice.flatMap((ele: any) => ele.concat());
    // this.addFormControl();

    this.createForm();
    this.valueUpdate();
    this.totalPrice = parseFloat(this.tvariations[this.selectedVarient]?.price);

    // console.log(this.variationForm.controls);

  }

  /**
   * Create form
   */
  public createForm() {
   
    if (this.variations.length > 0) {
      console.log(this.tvariations[this.selectedVarient]);

      this.tvariations[this.selectedVarient].addonGroups?.map((grpEle: any, grpIndex: number) => {
        this.newGroup();
        grpEle?.addonItems?.map((ele: any, addonindex: number) => {
          this.getaddonControl(grpIndex).push(this.newaddongroup());
          this.createFormControl(grpIndex, addonindex, ele.id)
          // this.addedItemcontrol(index, ele.id)
        });
       
      });

    }

    if (this.taddOnChoice.length > 0) {
      this.taddOnChoice[0].addonItems.forEach((element: any, index: number) => {
        this.getadOnchoicegroup().controls.push(this.newaddongroup());
        (<FormGroup>this.getadOnchoicegroup().controls[index]).addControl(element.id, new FormControl(false))
      });


    }

    console.log( this.variationForm , this.addonForm);
    

  }

  newGroup(): void {
    this.getadOngroup().push(this.addGroup());
  }
  addGroup(): FormGroup {
    return this.formBuilder.group({
      addons: this.formBuilder.array([])
    });
  }
  newaddongroup(): FormGroup {
    return this.formBuilder.group({});
  }
  getadOngroup(): FormArray {
    return this.variationForm.get('addOngrp') as FormArray;
  }

  getaddonControl(grpindex: number) {
    return (<FormArray>(<FormGroup>this.getadOngroup().controls[grpindex]).controls['addons']).controls;
  }
  createFormControl(grpindex: number, addonindex: number, ctrl: string) {
    (<FormGroup>(<FormArray>(<FormGroup>this.getadOngroup().controls[grpindex]).controls['addons']).controls[addonindex]).addControl(ctrl, new FormControl(false));
  }

  getadOnchoicegroup(): FormArray {
    return this.addonForm.get('addOngrp') as FormArray;
  }

  selectVariet(index: number) {
    this.selectedVarient = index;
    this.totalPrice = parseFloat(this.tvariations[this.selectedVarient]?.price);
    // this.addFormControl();
    // this.variationForm.reset();
    this.clearAllForms();
    this.createForm();
    this.valueUpdate();
    console.log(this.variationForm.controls);

  }

  valueUpdate() {
    this.totalPrice = parseFloat(this.tvariations[this.selectedVarient]?.price);
    this.variationForm.valueChanges.subscribe((value: any) => {

      console.log("FORMVALUE", value);
      // this.tvariations[this.selectedVarient].addonGroups[0].addonItems.map((ele:any) =>{
      //   if(value[ele.id] == true){
      //    this.totalPrice = this.totalPrice + parseFloat(ele.addonItemPrice) ;
      //   }
      // })
    });

    // console.log(this.tvariations[this.selectedVarient].addonGroups[0].addonItems);
  }
  minus():void{
    this.quantity > 1 ? this.quantity = this.quantity - 1 : this.quantity = 1;
  }
  plus():void{
    this.quantity = this.quantity + 1 ;
  }
  public addCart() {
    let selecetdVerAddonList: any = [];
    let selecetdAddonList: any = [];

    let selectedVarientValue = this.variationForm.getRawValue();
    let selectedAddonValue = this.addonForm.getRawValue();
    // console.log(selectedVarientValue, this.tvariations);
    // console.log(selectedAddonValue, this.taddOnChoice);

    selectedVarientValue!.addOngrp.forEach((element: any, index: number) => {
      element.addons.forEach((adonEle: any, innerIndex: number) => {
        if (Object.values(adonEle)[0])
          selecetdVerAddonList.push(this.tvariations[0].addonGroups[index].addonItems[innerIndex].addonItemName);
      });

    });

    selectedAddonValue!.addOngrp.forEach((ele: any, index: number) => {
      if (Object.values(ele)[0])
        selecetdAddonList.push(this.taddOnChoice[0].addonItems[index].addonItemName);

    })

    const addonVariation = {
      varients: this.tvariations[this.selectedVarient],
      variationaddOns: this.variationForm.getRawValue(),
      VatiationAddOnName: selecetdVerAddonList,
      addons: this.addonForm.getRawValue(),
      addonDetails: this.taddOnChoice,
      addOnNames: selecetdAddonList,
      quantity: this.quantity
    }
    // console.log(addonVariation);

    this.addedItem.emit({ action: "add", addonVariation });
    this.variations = [];
    this.addOnChoice = [];
    this.clearAllForms();
  }

  public clearAllForms():void {
    this.variationForm = this.formBuilder.group({
      addOngrp: this.formBuilder.array([])
    });
    this.addonForm = this.formBuilder.group({
      addOngrp: this.formBuilder.array([])
    });
  }

  // get emptyObjects(array:any):any {
  //   console.log(emptyObjects);
    
  //   // return this.array.filter(obj => Object.keys(obj).length === 0);
  // }
}
