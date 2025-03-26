import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DiscountPricePipe } from "../../core/pipes/discount-price.pipe";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-variation-addon',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DiscountPricePipe],
  templateUrl: './variation-addon.component.html',
  styleUrl: './variation-addon.component.scss'
})
export class VariationAddonComponent  implements OnInit {

  
  flatDiscountpercentage: number = environment.flatDiscountpercentage;

  @Input() menuItem: any;
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
    console.log(this.addOnChoice, this.taddOnChoice);
    this.createForm();
    this.valueUpdate();
    this.totalPrice = parseFloat(this.tvariations[this.selectedVarient]?.price);

    // console.log(this.variationForm.controls);

  }

  /**
   * Create form
   */
  public createForm() {
   this.clearAllForms();
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
      // this.taddOnChoice[0].addonItems.forEach((element: any, index: number) => {
      //   this.getadOnchoicegroup().controls.push(this.newaddongroup());
      //   (<FormGroup>this.getadOnchoicegroup().controls[index]).addControl(element.id, new FormControl(false))
      // });


      this.createAddonForm();

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

  // getadOnchoicegroup(): FormArray {
  //   return this.addonForm.get('addOngrp') as FormArray;
  // }

  // getaddonchoiceControl(grpindex: number) :any{
  //   console.log(((<FormGroup>this.getadOnchoicegroup().controls[grpindex]).controls));
    
  //   return ((<FormGroup>this.getadOnchoicegroup().controls[grpindex]).controls);
  // }

  /**
   * 
   * 
   */
  createAddonForm(): void {
    this.addonForm = this.formBuilder.group({
      data: this.formBuilder.array(this.taddOnChoice.map((group:any) => this.createAddonGroup(group)))
    });
  }
  // createAddonGroup(group: any): FormGroup {
  //   return this.formBuilder.group({
  //     addonGroupName: [group.addonGroupName],
  //     addonGroupItems: this.formBuilder.array(
  //       group.addonItems.map((item:any, index:number) => this.createAddonItem(item, index))
  //     )
  //   });
  // }
  createAddonGroup(group: any): FormGroup {
    return this.formBuilder.group({
      addonGroupName: [group.addonGroupName],
      addonGroupId:[group.id],
      // selectedAddon: [group.addonItems[0]?.id]  
      // selectedAddon: [group.addonItemSelectionMin === '1' ? group.addonItems[0].id : '']
      selectedAddon: group.addonItemSelectionMin === "1" 
      ? new FormControl('') // Single selection (radio)
      : new FormArray([])   // Multiple selection (checkbox)
    });
  }

  get dataFormArray() {
    return this.addonForm.get('data') as FormArray;
  }

  createAddonItem(item: any, i:number): FormGroup {
    let selected = [false];
    i == 0 ? selected = [true] :selected = [false] 
    return this.formBuilder.group({
      id: [item.id],
      addonItemName: [item.addonItemName],
      selected:selected
      // Checkbox Control
    });
  }

  get dataArray(): FormArray {
    return this.addonForm.get('data') as FormArray;
  }

  getAddonGroupItems(index: number): FormArray {
    return this.dataArray.at(index).get('addonGroupItems') as FormArray;
  }
  // Addons- Form Creation Ends



  selectVariet(index: number) {
    this.selectedVarient = index;
    this.totalPrice = parseFloat(this.tvariations[this.selectedVarient]?.price);
    // this.addFormControl();
    // this.variationForm.reset();
    this.clearAllForms();
    this.createForm();
    this.valueUpdate();
    console.log(this.variationForm.controls, this.tvariations[this.selectedVarient]);

  }

  toggleCheckbox(event: any, groupIndex: number, itemId: string) {
    const selectedAddonArray = this.dataFormArray.at(groupIndex).get('selectedAddon') as FormArray;
    // console.log(this.taddOnChoice[groupIndex]);
    
    if (event.target.checked) {
      selectedAddonArray.push(new FormControl(itemId));
    } else {
      const index = selectedAddonArray.controls.findIndex(x => x.value === itemId);
      selectedAddonArray.removeAt(index);
    }
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
    this.addonForm.valueChanges.subscribe(value => {
      console.log('Form value changed:', value, this.addonForm);
     
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
    // let selectedAddonValue = this.addonForm.getRawValue();
    let selectedAddonValue = this.addonForm.value;
    // console.log(selectedVarientValue, this.tvariations);
    console.log(selectedAddonValue);

    selectedVarientValue!.addOngrp.forEach((element: any, index: number) => {
      element.addons.forEach((adonEle: any, innerIndex: number) => {
        if (Object.values(adonEle)[0])
          selecetdVerAddonList.push(this.tvariations[0].addonGroups[index].addonItems[innerIndex].addonItemName);
      });

    });

    // selectedAddonValue!.addOngrp.forEach((ele: any, index: number) => {
    //   if (Object.values(ele)[0])
    //     selecetdAddonList.push(this.taddOnChoice[0].addonItems[index].addonItemName);

    // })

    const addonVariation = {
      varients: this.tvariations[this.selectedVarient],
      variationaddOns: this.variationForm.getRawValue(),
      VatiationAddOnName: selecetdVerAddonList,
      addons: this.addonForm.value,
      addonDetails: this.taddOnChoice,
      addOnNames: selecetdAddonList,
      quantity: this.quantity
    }
    console.log('addonVariation',addonVariation);

    this.addedItem.emit({ action: "add", addonVariation });
    this.variations = [];
    this.addOnChoice = [];
    this.tvariations= {};
    this.taddOnChoice = {};
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

  /**
   * To check array of objects empty or not
   * @param array array of objects
   * @returns boolean true/false
   */
  emptyObjects(array:any):any {
    
    return array?.filter((obj:any) => {
     Object.keys(obj).length === 0;
    });
  }

  // onAddonChange(value: any): void {
  //   console.log('Addon Changed:', value, this.addonForm.getRawValue());
  // }



  get addOngrp(): FormArray {
    return this.addonForm.get('addOngrp') as FormArray;
  }

  getAddonItems(groupIndex: number): FormArray {
    return this.addOngrp.at(groupIndex).get('addonItems') as FormArray;
  }

  // submitForm(): void {
  //   console.log(this.addonForm.value);
  // }
}
