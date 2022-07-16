import { Component, OnInit } from '@angular/core';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { RolesModelComponent } from 'src/app/modals/roles-model/roles-model.component';
import { User } from 'src/app/_models/user';
import { AdminService } from 'src/app/_services/admin.service';

@Component({
  selector: 'app-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: Partial<User[]> = [];
  bsModalRef!: BsModalRef;

  constructor(private adminService: AdminService, private modalService: BsModalService) { }

  ngOnInit(): void {
    this.getUsersWithRoles();
  }

  getUsersWithRoles() {
    this.adminService.getUsersWithRoles().subscribe(users => {
      this.users = users;
    })
  }

  openRolesModal(userValue: any) {
    const user: User = userValue;
    const config: ModalOptions = {
      initialState: {
        class: 'modlal-dialog-centered',
        user,
        roles: this.getRolesArray(user)
      }
    };

    this.bsModalRef = this.modalService.show(RolesModelComponent, config);
    this.bsModalRef.content.updateSelectedRoles.subscribe((values: any[]) => {
      const rolesToUpdate = {
        roles: [...values.filter(el => el.checked === true).map(el => el.name)]
      };
      if (rolesToUpdate) {
        this.adminService.updateUserRoles(user.userName, rolesToUpdate.roles).subscribe(() => {
          user.roles = [...rolesToUpdate.roles]
        })
      }
    })
  }

  private getRolesArray(user: User) {
    const roles = Array();
    const userRoles = user.roles;
    const availableRoles: any[] = [
      { name: 'Admin', value: 'Admin' },
      { name: 'Moderator', value: 'Moderator' },
      { name: 'Member', value: 'Member' }
    ];

    availableRoles.forEach(role => {
      let isMatch = false;
      for (const userRole in userRoles) {
        if (role.name === userRoles[userRole]) {
          isMatch = true;
          role.checked = true;
          roles.push(role);
          break;
        }
      }
      if (!isMatch) {
        role.checked = false;
        roles.push(role);
      }
    });
    return roles;
  }
}
