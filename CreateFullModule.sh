#!/bin/bash
read -p "Enter Module Name - Module name MUST BE lowercase hypen separated: 
" MODULE_NAME

read -p "Enter Capitalized Module Name: 
" MODULE_NAME_UPPERCASE

echo -e "\n-------------------------------------------------------------"
echo -e "            Nest Module & Controller Creation                "
echo -e "-------------------------------------------------------------\n"

read -p "If a module named '${MODULE_NAME}' already exists it will be removed. Continue (Y) Exit (N)
" CONSENT

if [ $CONSENT == 'Y' ]
then 
    echo -e "\n--------- Creating ${MODULE_NAME} ---------\n"
else
    echo "Exiting..."
    exit 0
fi

nest generate module ${MODULE_NAME}
nest generate controller ${MODULE_NAME}

cd src/$MODULE_NAME


rm -rf src/${MODULE_NAME}/${MODULE_NAME}.module.ts

echo -e "\n Updating module.ts \n"

cat << EOF > ${MODULE_NAME}.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ${MODULE_NAME_UPPERCASE}Controller } from './${MODULE_NAME}.controller';
import { ${MODULE_NAME_UPPERCASE}Repository } from './${MODULE_NAME}.repository';
import { ${MODULE_NAME} as ${MODULE_NAME_UPPERCASE} } from 'src/interfaces/entities/${MODULE_NAME}';

@Module({
  imports: [TypeOrmModule.forFeature([${MODULE_NAME_UPPERCASE}, ${MODULE_NAME_UPPERCASE}Repository])],
  controllers: [${MODULE_NAME_UPPERCASE}Controller]
})
export class ${MODULE_NAME_UPPERCASE}Module { }
EOF


echo -e "\n Updating cotroller.ts file \n"


cat << EOF > ${MODULE_NAME}.controller.ts 
import { Controller, UseGuards, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { ApiUseTags } from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ${MODULE_NAME_UPPERCASE}Repository } from 'src/${MODULE_NAME}/${MODULE_NAME}.repository';
import ${MODULE_NAME_UPPERCASE}Dto from 'src/${MODULE_NAME}/${MODULE_NAME}.dto';


// @UseGuards(AuthGuard('jwt'))
@ApiUseTags('${MODULE_NAME}')
@Controller('${MODULE_NAME}')
export class ${MODULE_NAME_UPPERCASE}Controller {
    constructor(
        @InjectRepository(${MODULE_NAME_UPPERCASE}Repository) private readonly ${MODULE_NAME}Repository: ${MODULE_NAME_UPPERCASE}Repository,
    ) { }


    @Get(':id')
    findOne(@Param('id') id: number) {
        return this.${MODULE_NAME}Repository.findOne${MODULE_NAME_UPPERCASE}(id)
    }

    @Post()
    create(@Body() ${MODULE_NAME}Dto: ${MODULE_NAME_UPPERCASE}Dto) {
        return this.${MODULE_NAME}Repository.create(${MODULE_NAME}Dto);
    }

    @Put(':id')
    update(@Param('id') id: number, @Body() ${MODULE_NAME}Dto: ${MODULE_NAME_UPPERCASE}Dto) {
        return this.${MODULE_NAME}Repository.update${MODULE_NAME_UPPERCASE}(id, ${MODULE_NAME}Dto);
    }

    @Delete(':id')
    remove(@Param('id') id: number) {
        return this.${MODULE_NAME}Repository.remove${MODULE_NAME_UPPERCASE}(id);
    }
}
EOF

echo -e "\n-------------------------------------------------------------"
echo "              Nest Repository & DTO Creation                "
echo -e "-------------------------------------------------------------\n"

touch ${MODULE_NAME}.repository.ts 
touch ${MODULE_NAME}.dto.ts

echo "CREATE /src/${MODULE_NAME}/${MODULE_NAME}.repository.ts "
echo -e "CREATE /src/${MODULE_NAME}/${MODULE_NAME}.dto.ts \n"

cat << EOF > ${MODULE_NAME}.repository.ts 
import { EntityRepository, Repository } from 'typeorm';
import ${MODULE_NAME_UPPERCASE}Dto from 'src/${MODULE_NAME}/${MODULE_NAME}.dto';
import { ${MODULE_NAME} as ${MODULE_NAME_UPPERCASE} } from 'src/interfaces/entities/${MODULE_NAME}';


//  Now, to manipulate the ${MODULE_NAME} objects, you need to create a repository ${MODULE_NAME}/${MODULE_NAME}.repository.ts.

@EntityRepository(${MODULE_NAME_UPPERCASE})
export class ${MODULE_NAME_UPPERCASE}Repository extends Repository<${MODULE_NAME_UPPERCASE}> {
  create${MODULE_NAME_UPPERCASE} = async (${MODULE_NAME}: ${MODULE_NAME_UPPERCASE}Dto) => {
    return await this.save(${MODULE_NAME});
  };

  findOne${MODULE_NAME_UPPERCASE} = async (id:  number) => {
    return this.findOneOrFail(id);
  };

  update${MODULE_NAME_UPPERCASE} = async (id:  number, ${MODULE_NAME}: ${MODULE_NAME_UPPERCASE}Dto) => {
    return this.save({ ...${MODULE_NAME}, id: Number(id) });
  };

  remove${MODULE_NAME_UPPERCASE} = async (id:  number) => {
    await this.findOneOrFail(id);
    return this.delete(id);
  };
}
EOF



cat << EOF > ${MODULE_NAME}.dto.ts 
import { ApiModelProperty } from '@nestjs/swagger';

export default class ${MODULE_NAME_UPPERCASE}Dto {
    @ApiModelProperty()
    readonly 
}
EOF

echo -e "\n Files have been created. \n \n Please update the dto file with the necessary fields from the interface file.\n"

# Loop through the interface file and dynamically add the properties to the dto file



#  while IFS='ManyToOne' read -ra FILE; do
#       for i in "${FILE[@]}"; do
#           # process "$i"
#           echo "i ---- ${i]"
#       done
#  done <<< "$DTO_PROPERTY_ARRAY"

